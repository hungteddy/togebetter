<template>
  <div class="question-detail">
    <el-row class="question-detail__row">
      <el-col :xs="24" :md="16" class="bg-white round bs-border mt-8">
        <div class="question-detail__content">
          <div v-if="loading" class="skeleton-wrapper">
            <base-skeleton></base-skeleton>
            <base-skeleton></base-skeleton>
            <base-skeleton></base-skeleton>
          </div>

          <template v-else>
            <el-alert
              v-if="isClosed"
              title="Closed question"
              type="info"
              description="Edit existing answers to improve this post. It is not currently accepting new answers."
              show-icon
              effect="dark"
              :closable="false"
              class="mb-16"
            >
            </el-alert>

            <chat-bubble
              :content="question"
              :isClosed="isClosed"
              @delete="deleteQuestion(id)"
              @reply="reply(question.ownerID)"
              @edit="handleEditQuestion"
              @close="handleCloseQuestion"
              borderColor="#f65e39"
            ></chat-bubble>

            <div v-if="comments.length">
              <chat-bubble
                v-for="comment in comments"
                type="comment"
                :key="comment.id"
                :content="comment"
                :isClosed="isClosed"
                :is-featured="question.featuredAnswer === comment.id"
                :questionOwnerID="question.ownerID"
                :questionContent="question.content"
                @delete="deleteComment(comment.id)"
                @reply="reply(comment.ownerID)"
              ></chat-bubble>
            </div>
          </template>
        </div>

        <div ref="answerForm" class="answer-form" v-if="!isClosed" v-loading="loadingUpload">
          <div v-if="!user" class="text-center py-16">
            <p>
              Log in or sign up to leave a comment
            </p>
            <router-link to="/login">
              <el-button class="mr-16">Log in</el-button>
            </router-link>
            <router-link to="/signup">
              <el-button type="primary">Sign up</el-button>
            </router-link>
          </div>
          <div v-else>
            <div v-if="photoURL" style="position: relative; width: fit-content;">
              <el-image :src="photoURL" class="answer-form__image" fit="cover">
                <div slot="placeholder" class="text-center p-16">
                  <i class="el-icon-loading"></i>
                </div>
              </el-image>
              <span @click="removePhoto" class="answer-form__image__remove">
                <i class="el-icon-circle-close"></i>
              </span>
            </div>
            <div v-if="videoURL" style="position: relative; width: fit-content;">
              <video :src="videoURL" class="answer-form__image" controls></video>
              <span @click="removeVideo" class="answer-form__image__remove">
                <i class="el-icon-circle-close"></i>
              </span>
            </div>
            <div class="answer-form__audio" v-if="audioURL">
              <audio type="audio/mpeg" :src="audioURL" controls>
                Your browser does not support the
                <code>audio</code> element.
              </audio>
              <span class="answer-form__audio__remove" @click="removeAudio">
                <i class="el-icon-error"></i>
              </span>
            </div>
            <div class="answer-form__input-wrapper">
              <mentionable
                class="answer-form__input"
                :keys="['@']"
                :items="listUsers"
                offset="6"
                @open="onOpenMention"
              >
                <textarea
                  ref="answer"
                  v-model="answer"
                  rows="3"
                  placeholder="Answer in his/her native language as he/she is a beginner speaker."
                />

                <template #item-@="{ item }">
                  <div class="center-y">
                    <el-avatar :src="item.photoURL" alt="#" :size="36" class="mr-8"></el-avatar>
                    {{ item.username }}
                  </div>
                </template>
              </mentionable>
              <el-button
                class="answer-form__send"
                type="primary"
                size="mini"
                :loading="loadingSubmit"
                :disabled="!alreadyInput"
                @click="submit"
              >
                Send
              </el-button>
            </div>
            <div class="button-group">
              <div class="button-group__item">
                <i class="iconfont icon-keyboard"></i>
              </div>
              <record-audio
                @done="handleRecordAudio"
                class="button-group__item"
                :disable-preview="true"
              >
                <i class="iconfont icon-mic"></i>
              </record-audio>
              <el-upload
                action="#"
                accept="image/*"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleChangeUpload"
              >
                <div class="button-group__item">
                  <i class="iconfont icon-photo"></i>
                </div>
              </el-upload>
              <el-upload
                action="#"
                accept="video/*"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleUploadVideo"
              >
                <div class="button-group__item">
                  <i class="iconfont icon-movie"></i>
                </div>
              </el-upload>
              <chat-sticker @select="selectSticker">
                <div class="button-group__item">
                  <i class="iconfont icon-emoji"></i>
                </div>
              </chat-sticker>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Related post  -->
      <el-col :xs="24" :md="8" class="question-detail__right">
        <div class="question-related">
          <question-need-your-help
            v-if="question && user"
            :title="$t('questions.needHelp')"
            :user="user"
            :currentQuestionID="question.id"
          ></question-need-your-help>
          <question-related
            v-if="question"
            :title="$t('questions.related')"
            :lang="question.lang"
            :questionType="question.questionType"
            :currentQuestionID="question.id"
          ></question-related>
          <question-newest
            v-if="question"
            :title="$t('questions.newest')"
            :lang="question.lang"
            :currentQuestionID="question.id"
          ></question-newest>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-if="showEditQuesiton"
      title="Edit Question"
      :visible.sync="showEditQuesiton"
      :append-to-body="true"
      custom-class="edit-question"
      top="80px"
      width="90%"
    >
      <question-edit :question-data="question"></question-edit>
    </el-dialog>
  </div>
</template>

<script>
import BaseSkeleton from '@/components/atoms/Skeleton/BaseSkeleton.vue';
import ChatBubble from '@/components/molecules/ChatBubble.vue';
import QuestionRelated from '@/components/molecules/QuestionRelated.vue';
import QuestionNewest from '@/components/molecules/QuestionNewest.vue';
import QuestionNeedYourHelp from '@/components/molecules/QuestionNeedYourHelp.vue';
import RecordAudio from '@/components/atoms/RecordAudio.vue';
import ChatSticker from '@/components/atoms/ChatSticker.vue';
import QuestionEdit from '@/components/organisms/QuestionEdit.vue';
import { Mentionable } from 'vue-mention';
import { db, FieldValue } from '@/firebase';
import { questionsIndex } from '@/algolia';
import { mapState } from 'vuex';
import uploadMixin from '@/mixins/upload';
import savePosition from '@/mixins/savePosition';
import notiMixin from '@/mixins/notification';
import mentionedUser from '@/helpers/mentionedUser';

export default {
  name: 'QuestionDetail',
  components: {
    ChatBubble,
    RecordAudio,
    ChatSticker,
    Mentionable,
    BaseSkeleton,
    QuestionRelated,
    QuestionNewest,
    QuestionNeedYourHelp,
    QuestionEdit,
  },
  mixins: [uploadMixin, savePosition, notiMixin],

  data() {
    return {
      showEditQuesiton: false,
      loadingSubmit: false,
      answer: '',
      question: null,
      comments: [],
      snapshot: null,
      listIdUsers: new Set(),
      listUsers: [],
      loading: false,
    };
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      listUsersCached: (state) => state.ui.listUsers,
    }),

    id() {
      return this.$route.params.id;
    },

    alreadyInput() {
      return !!this.answer || !!this.audioURL || !!this.photoURL;
    },

    isClosed() {
      if (this.question) {
        return this.question.status === 'closed';
      }
      return false;
    },
  },

  created() {
    this.getData();
  },

  beforeDestroy() {
    this.snapshot();
  },

  methods: {
    onOpenMention() {
      this.listUsers = this.listUsersCached
        .filter((item) => this.listIdUsers.has(item.id))
        .map((item) => ({
          value: item.username,
          ...item,
        }));
    },

    async getData() {
      this.loading = true;
      const commentRef = db.collection('comments');
      const res = await db
        .collection('questions')
        .doc(this.id)
        .get();
      if (res.exists) {
        // Add user to push notification
        this.listIdUsers.add(res.data().ownerID);
        this.question = {
          id: this.id,
          ...res.data(),
        };
        this.snapshot = await commentRef
          .where('questionID', '==', this.id)
          .orderBy('createdAt', 'asc')
          .onSnapshot((querySnapshot) => {
            const comments = [];
            querySnapshot.forEach((doc) => {
              this.listIdUsers.add(doc.data().ownerID);
              const comment = {
                id: doc.id,
                ...doc.data(),
              };

              // Check if has the featured answer shift it to top
              if (doc.id === this.question.featuredAnswer) {
                comments.unshift(comment);
              } else {
                comments.push(comment);
              }
            });
            // Update comments
            this.comments = comments;
            const timeout = setTimeout(() => {
              this.loading = false;
              clearTimeout(timeout);
            }, 500);
          });
      } else {
        this.$router.push({ name: '404' });
      }
    },

    selectSticker(stickerURL) {
      this.photoURL = stickerURL;
      this.answer = '';
      this.audioURL = '';
      this.submit();
    },

    handleCloseQuestion() {
      this.$confirm(
        'You cannot undo this action! Are you sure to close this question?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        },
      ).then(async () => {
        await db
          .collection('questions')
          .doc(this.id)
          .update({
            status: 'closed',
          });
        this.question.status = 'closed';
      });
    },

    deleteComment(commentID) {
      this.$confirm('Are you sure you want to delete?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'danger',
      }).then(async () => {
        await db
          .collection('comments')
          .doc(commentID)
          .delete();
        await db
          .collection('questions')
          .doc(this.id)
          .update({
            comments: FieldValue.arrayRemove(commentID),
          });
        questionsIndex.partialUpdateObject({
          objectID: this.id,
          answers: {
            _operation: 'Decrement',
            value: 1,
          },
        });
        await db
          .collection('users')
          .doc(this.user.id)
          .update({
            totalAnswers: FieldValue.increment(-1),
          });
        this.$message({
          message: 'Delete completed',
          type: 'success',
        });
      });
    },

    deleteQuestion(questionID) {
      this.$confirm('Are you sure you want to delete?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'danger',
      }).then(async () => {
        await db
          .collection('questions')
          .doc(questionID)
          .delete();
        await db
          .collection('comments')
          .where('questionID', '==', questionID)
          .get()
          .then((querySnapshot) => {
            // Once we get the results, begin a batch
            const batch = db.batch();
            querySnapshot.forEach((doc) => {
              // For each doc, add a delete operation to the batch
              batch.delete(doc.ref);
            });
            // Commit the batch
            return batch.commit();
          })
          .then(() => {
            this.$message({
              message: 'Delete completed',
              type: 'success',
            });
          });
        await db
          .collection('users')
          .doc(this.user.id)
          .update({
            totalQuestions: FieldValue.increment(-1),
          });
        questionsIndex.deleteObject(questionID);
        this.$router.push({ name: 'home' });
      });
    },

    handleEditQuestion() {
      this.showEditQuesiton = true;
    },

    // eslint-disable-next-line no-unused-vars
    reply(ownerID) {
      const user = this.listUsersCached.find((item) => item.id === ownerID);
      this.answer = `@${user.username} `;
      const inputRef = this.$refs.answer;
      inputRef.focus();
      this.$refs.answerForm.scrollIntoView(false, { behavior: 'smooth' });
    },

    async submit() {
      this.loadingSubmit = true;
      const questionID = this.$route.params.id;
      const input = {
        questionID,
        ownerID: this.user.id,
        content: this.answer,
        audioURL: this.audioURL,
        photoURL: this.photoURL,
        videoURL: this.videoURL,
        votes: [],
        createdAt: FieldValue.serverTimestamp(),
      };
      const comment = await db.collection('comments').add(input);
      await db
        .collection('questions')
        .doc(this.$route.params.id)
        .update({
          comments: FieldValue.arrayUnion(comment.id),
        });

      // Analytics
      this.$store.dispatch('analytics/answer', {
        questionID,
        userID: this.user.id,
      });

      questionsIndex.partialUpdateObject({
        objectID: questionID,
        answers: {
          _operation: 'Increment',
          value: 1,
        },
      });

      await db
        .collection('users')
        .doc(this.user.id)
        .update({
          totalAnswers: FieldValue.increment(1),
        });

      const mentions = mentionedUser(this.answer, this.listUsersCached);
      if (mentions.length) {
        mentions.forEach((item) => {
          this.notifyMentionUser(comment.id, item.id);
        });
      } else {
        this.notifyToUser(comment.id);
      }

      this.loadingSubmit = false;
      this.photoURL = '';
      this.audioURL = '';
      this.videoURL = '';
      this.answer = '';
    },

    notifyMentionUser(id, userMentionedID) {
      const noti = {
        senderID: this.user.id,
        receiveID: userMentionedID,
        questionID: this.question.id,
        detectID: `${this.user.id}_${id}`,
        message: 'mention',
      };
      this.sendNotification(noti);
    },

    notifyToUser(id) {
      if (this.question.ownerID === this.user.id) return;

      const noti = {
        senderID: this.user.id,
        receiveID: this.question.ownerID,
        questionID: this.question.id,
        detectID: `${this.user.id}_${id}`,
        message: 'answer',
      };
      this.sendNotification(noti);
    },
  },
};
</script>
