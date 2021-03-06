<template>
  <div class="profile" v-loading="loading">
    <div class="profile__wrapper" v-if="currentUser">
      <div class="profile__overview">
        <el-row>
          <el-col :xs="24" :md="8">
            <div class="profile__avatar-wrapper">
              <el-image class="profile__avatar" :src="currentUser.photoURL"></el-image>
              <div class="profile__username">
                {{ currentUser.username }}
              </div>
              <router-link
                tag="div"
                class="text-center"
                v-if="isOwner"
                :to="{ name: 'edit-profile', params: { id: user.id } }"
              >
                <el-button size="mini" icon="iconfont icon-edit" plain>
                  {{ $t('profile.edit') }}
                </el-button>
              </router-link>
              <report-user v-else :userID="user.id"></report-user>
            </div>
          </el-col>
          <el-col :xs="24" :md="16">
            <apex-chart
              type="bar"
              height="300"
              :options="chartOptions"
              :series="series"
            ></apex-chart>
          </el-col>
        </el-row>
      </div>

      <el-tabs v-model="activeName">
        <!-- Tab Profile  -->
        <el-tab-pane :label="$t('profile.profile')" name="profile">
          <div>
            <base-map :countryCode="currentUser.knowingCountry"></base-map>
            <div class="profile__bio mt-8">
              <p class="text-bold">About me</p>
              <p class="profile__bio">
                {{ currentUser.bio }}
              </p>
            </div>
            <div class="profile__detail">
              <p class="profile__detail__title">
                <i class="el-icon-time mr-8"></i>
                Joined <b> {{ time }} </b>
              </p>
            </div>
            <div class="profile__detail">
              <p class="profile__detail__title">
                <i class="iconfont icon-earth mr-8"></i>
                From <b>{{ currentUser.knowingCountry | countryName }}</b>
              </p>
            </div>
            <div class="profile__detail">
              <p class="profile__detail__title">
                <i class="iconfont icon-message mr-8"></i>
                Native language <b>{{ currentUser.nativeLanguage | languageName }}</b>
              </p>
            </div>
            <div class="profile__detail">
              <p class="profile__detail__title">
                <i class="el-icon-edit mr-8"></i>
                Languages of interest
              </p>
              <level-icon
                v-for="item in currentUser.interestLanguages"
                :key="item.lang"
                :level="item.level"
              >
                <b>{{ item.lang | languageName }}</b>
                <el-popconfirm
                  v-if="isOwner && currentUser.interestLanguages.length > 1"
                  title="Are you sure to delete this?"
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  @onConfirm="removeLanguage(item)"
                >
                  <i slot="reference" class="el-icon-delete hover-text--primary p-8"></i>
                </el-popconfirm>
              </level-icon>
              <el-link
                v-if="isOwner"
                class="ml-8"
                type="primary"
                @click="addLanguageVisible = true"
              >
                + Add more
              </el-link>

              <div v-if="addLanguageVisible">
                <el-dialog
                  title="Add Language"
                  :visible.sync="addLanguageVisible"
                  top="60px"
                  width="90%"
                  custom-class="max-w-600"
                  append-to-body
                >
                  <el-form label-position="top" size="medium">
                    <input-interest-language @add="handleAddLanguage"></input-interest-language>
                  </el-form>
                </el-dialog>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab Questions  -->
        <el-tab-pane
          v-loading="loadingTab"
          :label="$t('profile.questions')"
          name="questions"
          class="profile__post"
          lazy
        >
          <div v-if="!loadingTab && !questions.length" class="profile__post--error">
            <el-image
              src="https://firebasestorage.googleapis.com/v0/b/togebetter.appspot.com/o/img%2Fhugo-292.png?alt=media&token=a02f5342-1704-4e81-ac7f-134feb83a105"
              lazy
            ></el-image>
            You haven't asked any questions yet.
          </div>
          <question-bubble
            v-else
            v-for="question in questions"
            :key="question.id"
            :content="question"
          ></question-bubble>
          <div class="text-center">
            <el-button
              v-if="!noMoreQuestion"
              type="primary"
              size="small"
              :loading="loadingTab"
              plain
              @click="loadMore('questions')"
            >
              Load more
            </el-button>
          </div>
        </el-tab-pane>

        <!-- Tab Answers  -->
        <el-tab-pane
          v-loading="loadingTab"
          :label="$t('profile.answers')"
          name="answers"
          lazy
          class="profile__post"
        >
          <div v-if="!loadingTab && !answers.length" class="profile__post--error">
            <el-image
              src="https://firebasestorage.googleapis.com/v0/b/togebetter.appspot.com/o/img%2Fhugo-292.png?alt=media&token=a02f5342-1704-4e81-ac7f-134feb83a105"
              lazy
            ></el-image>
            You haven't answered any questions yet.
          </div>
          <chat-bubble
            v-else
            v-for="comment in answers"
            :key="comment.id"
            :content="comment"
            @delete="deleteComment(comment.id, comment.questionID)"
            mode="view"
          ></chat-bubble>
          <div class="text-center">
            <el-button
              v-if="!noMoreAnswer"
              type="primary"
              size="small"
              :loading="loadingTab"
              plain
              @click="loadMore('comments')"
            >
              Load more
            </el-button>
          </div>
        </el-tab-pane>

        <!-- Tab Posts  -->
        <el-tab-pane
          v-loading="loadingTab"
          :label="$t('profile.posts')"
          name="posts"
          class="profile__post"
          lazy
        >
          <div v-if="!loadingTab && !posts.length" class="profile__post--error">
            <el-image
              src="https://firebasestorage.googleapis.com/v0/b/togebetter.appspot.com/o/img%2Fhugo-292.png?alt=media&token=a02f5342-1704-4e81-ac7f-134feb83a105"
              lazy
            ></el-image>
            You haven't any posts yet.
          </div>
          <post v-else v-for="post in posts" :key="post.id" :post="post"> </post>
          <div class="text-center">
            <el-button
              v-if="!noMorePost"
              type="primary"
              size="small"
              :loading="loadingTab"
              plain
              @click="loadMore('posts')"
            >
              Load more
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import LevelIcon from '@/components/atoms/LevelIcon.vue';
import BaseMap from '@/components/atoms/BaseMap.vue';
import ReportUser from '@/components/atoms/ReportUser.vue';
import ApexChart from 'vue-apexcharts';
import QuestionBubble from '@/components/molecules/QuestionBubble.vue';
import ChatBubble from '@/components/molecules/ChatBubble.vue';
import InputInterestLanguage from '@/components/molecules/InputInterestLanguage.vue';
import { mapState } from 'vuex';
import { db, FieldValue } from '@/firebase';
import { questionsIndex } from '@/algolia';
import timeago from '@/helpers/timeago';
import Post from '@/components/atoms/Post.vue';

export default {
  name: 'Profile',
  components: {
    LevelIcon,
    QuestionBubble,
    ChatBubble,
    InputInterestLanguage,
    BaseMap,
    Post,
    ApexChart,
    ReportUser,
  },

  data() {
    return {
      addLanguageVisible: false,
      currentUser: null,
      loading: false,
      loadingTab: false,
      activeName: 'profile',
      limit: 5,
      questions: [],
      answers: [],
      posts: [],
      noMoreQuestion: true,
      noMoreAnswer: true,
      noMorePost: true,
      lastQuestionDoc: null,
      lastAnswerDoc: null,
      lastPostDoc: null,
      coordinates: null,
      series: [{ name: 'Amount', data: [21, 22, 10] }],
      chartOptions: {
        chart: {
          height: 300,
          type: 'bar',
          toolbar: {
            show: true,
            tools: {
              download: false,
            },
          },
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
            dataLabels: {
              position: 'center',
            },
          },
        },

        colors: ['#f65e39', '#409eff', '#8bc34a'],
        legend: {
          position: 'right',
          offsetY: 20,
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        xaxis: {
          categories: ['Points', 'Questions', 'Answers'],
          labels: {
            style: {
              colors: ['#f65e39', '#409eff', '#8bc34a'],
              fontSize: '12px',
            },
          },
        },
      },
    };
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),

    time() {
      if (this.currentUser) return timeago(this.currentUser.createdAt.toDate());
      return timeago(new Date());
    },

    isOwner() {
      return this.user && this.currentUser.id === this.user.id;
    },
  },

  watch: {
    activeName(value) {
      if (value === 'questions') {
        if (this.questions.length) return;
        this.loadingTab = true;
        // Get questions
        db.collection('questions')
          .where('ownerID', '==', this.currentUser.id)
          .orderBy('createdAt', 'desc')
          .limit(this.limit)
          .get()
          .then((querySnapshot) => {
            const questions = [];
            querySnapshot.forEach((doc) => {
              questions.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            this.lastQuestionDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.docs.length < this.limit) {
              this.noMoreQuestion = true;
            } else {
              this.noMoreQuestion = false;
            }

            this.questions = this.questions.concat(questions);
            this.loadingTab = false;
          });
      } else if (value === 'answers') {
        if (this.answers.length) return;

        this.loadingTab = true;
        // Get answers
        db.collection('comments')
          .where('ownerID', '==', this.currentUser.id)
          .orderBy('createdAt', 'desc')
          .limit(this.limit)
          .get()
          .then((querySnapshot) => {
            const answers = [];
            querySnapshot.forEach((doc) => {
              answers.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            this.lastAnswerDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.docs.length < this.limit) {
              this.noMoreAnswer = true;
            } else {
              this.noMoreAnswer = false;
            }

            this.answers = this.answers.concat(answers);
            this.loadingTab = false;
          });
      } else if (value === 'posts') {
        if (this.posts.length) return;

        this.loadingTab = true;
        // Get answers
        db.collection('posts')
          .where('author', '==', this.currentUser.id)
          .orderBy('createdAt', 'desc')
          .limit(this.limit)
          .get()
          .then((querySnapshot) => {
            const posts = [];
            querySnapshot.forEach((doc) => {
              posts.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            this.lastPostDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (querySnapshot.docs.length < this.limit) {
              this.noMorePost = true;
            } else {
              this.noMorePost = false;
            }

            this.posts = this.posts.concat(posts);
            this.loadingTab = false;
          });
      }
    },
  },

  created() {
    this.getData();
  },

  methods: {
    async getData() {
      const userID = this.$route.params.id;
      this.loading = true;
      const doc = await db
        .collection('users')
        .doc(userID)
        .get();

      if (doc.exists) {
        const user = {
          id: doc.id,
          ...doc.data(),
        };
        this.series = [
          { name: 'Amount', data: [user.points, user.totalAnswers, user.totalQuestions] },
        ];
        this.currentUser = user;
        this.loading = false;
      } else {
        this.$router.push({ name: '404' });
      }
    },

    async loadMore(collectionName) {
      this.loadingTab = true;
      let lastDoc;
      switch (collectionName) {
        case 'questions':
          lastDoc = this.lastQuestionDoc;
          break;
        case 'comments':
          lastDoc = this.lastAnswerDoc;
          break;
        default:
          lastDoc = this.lastPostDoc;
          break;
      }
      let querySnapshot;
      if (collectionName === 'posts') {
        querySnapshot = await db
          .collection(collectionName)
          .where('author', '==', this.currentUser.id)
          .orderBy('createdAt', 'desc')
          .startAfter(lastDoc)
          .limit(this.limit)
          .get();
      } else {
        querySnapshot = await db
          .collection(collectionName)
          .where('ownerID', '==', this.currentUser.id)
          .orderBy('createdAt', 'desc')
          .startAfter(lastDoc)
          .limit(this.limit)
          .get();
      }

      // Get the last visible document
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      if (querySnapshot.docs.length < this.limit) {
        switch (collectionName) {
          case 'questions':
            this.noMoreQuestion = true;
            break;
          case 'comments':
            this.noMoreAnswer = true;
            break;
          default:
            this.noMorePost = true;
            break;
        }
      }
      switch (collectionName) {
        case 'questions':
          this.lastQuestionDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.questions = this.questions.concat(data);
          break;
        case 'comments':
          this.lastAnswerDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.answers = this.answers.concat(data);
          break;
        default:
          this.lastPostDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.posts = this.posts.concat(data);
          break;
      }

      this.loadingTab = false;
    },

    deleteComment(commentID, questionID) {
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
          .doc(questionID)
          .update({
            comments: FieldValue.arrayRemove(commentID),
          });
        questionsIndex.partialUpdateObject({
          objectID: questionID,
          comments: {
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
        this.$router.go();
      });
    },

    async handleAddLanguage(data) {
      const isDuplicate = this.currentUser.interestLanguages.findIndex((item) => {
        return item.lang === data.lang;
      });
      if (isDuplicate !== -1) {
        this.$message({
          type: 'error',
          message: "You've already added this language",
        });
      } else {
        await db
          .collection('users')
          .doc(this.currentUser.id)
          .update({
            interestLanguages: FieldValue.arrayUnion(data),
          });
        this.$message({
          type: 'success',
          message: 'Added Successfully!!',
        });
        this.addLanguageVisible = false;
        this.getData();
      }
    },

    async removeLanguage(data) {
      await db
        .collection('users')
        .doc(this.currentUser.id)
        .update({
          interestLanguages: FieldValue.arrayRemove(data),
        });

      this.$message({
        type: 'success',
        message: 'Remove Successfully!!',
      });
      this.getData();
    },
  },
};
</script>
