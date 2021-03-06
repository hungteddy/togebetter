<template>
  <div class="posts box-content">
    <h1>Write a new post</h1>

    <!-- <el-upload
          class="mb-16"
          action="#"
          accept="image/*"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleChangeUpload"
        >
          <div v-if="photoURL">
            <img :src="photoURL" style="max-width: 100%" />
          </div>
          <el-button v-else size="small" type="primary" icon="el-icon-picture">
            Add cover
          </el-button>
        </el-upload>
        <el-button v-if="photoURL" type="danger" @click="removePhoto" class="mb-8">
          Remove
        </el-button> -->

    <p>Title</p>
    <el-input v-model="title" placeholder="Enter your title" class="mb-16"></el-input>

    <p>Tag</p>
    <el-select
      v-model="tags"
      multiple
      filterable
      allow-create
      placeholder="Enter tags for your post"
      class="mb-16"
    >
    </el-select>

    <div class="editor">
      <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <div class="editor-menubar">
          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <i class="iconfont icon-bold"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <i class="iconfont icon-italic"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            <i class="iconfont icon-strikethrough"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <i class="iconfont icon-underline"></i>
          </button>

          <el-upload
            class="d-inline-block"
            action="#"
            accept="image/*"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="
              (e) => {
                handleChangeUploadEditor(e, commands.image);
              }
            "
          >
            <button class="editor-menubar__button">
              <i class="iconfont icon-image-fill"></i>
            </button>
          </el-upload>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            <i class="iconfont icon-code-line"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            <i class="iconfont icon-paragraph"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            <i class="iconfont icon-list-unordered"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            <i class="iconfont icon-list-ordered"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            <i class="iconfont icon-double-quotes-r"></i>
          </button>

          <button
            class="editor-menubar__button"
            :class="{ 'is-active': isActive.code_block() }"
            @click="commands.code_block"
          >
            <i class="iconfont icon-code-box-line"></i>
          </button>

          <button class="editor-menubar__button" @click="commands.horizontal_rule">
            <i class="iconfont icon-hr"></i>
          </button>

          <button class="editor-menubar__button" @click="commands.undo">
            <i class="iconfont icon-undo"></i>
          </button>

          <button class="editor-menubar__button" @click="commands.redo">
            <i class="iconfont icon-redo"></i>
          </button>
        </div>
      </editor-menu-bar>

      <editor-content class="editor__content" :editor="editor"></editor-content>
    </div>
    <el-button class="mt-16" type="primary" @click="publishPost" :disabled="!havedInput">
      Publish
    </el-button>
  </div>
</template>

<script>
import upload from '@/mixins/upload';
// Import the editor
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Image,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Focus,
  Placeholder,
} from 'tiptap-extensions';
import { db, FieldValue } from '@/firebase';
import { mapState } from 'vuex';

export default {
  name: 'CreatePost',
  mixins: [upload],
  components: {
    EditorContent,
    EditorMenuBar,
  },

  data() {
    return {
      title: '',
      tags: [],
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Image(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Focus({
            className: 'has-focus',
            nested: true,
          }),
          new Placeholder({
            emptyEditorClass: 'is-editor-empty',
            emptyNodeClass: 'is-empty',
            emptyNodeText: 'Write something …',
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
          }),
        ],
        onUpdate: ({ getHTML }) => {
          this.html = getHTML();
        },
      }),
      html: '',
    };
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),

    havedInput() {
      return !!this.html && !!this.title;
    },
  },

  methods: {
    showImagePrompt(command) {
      if (this.photoURL !== null) {
        const src = this.photoURL;
        console.log(src);
        this.photoURL = null;
        command({ src });
      }
    },

    async publishPost() {
      const input = {
        title: this.title,
        html: this.html,
      };
      await db.collection('posts').add({
        ...input,
        author: this.user.id,
        tags: this.tags,
        votes: [],
        comments: [],
        totalVotes: 0,
        totalComments: 0,
        status: 'open',
        createdAt: FieldValue.serverTimestamp(),
      });

      this.$message({
        type: 'success',
        message: 'Your post has been published successfully',
      });

      // Analytics
      this.$store.dispatch('analytics/createPost', {
        userID: this.user.id,
        tags: this.tags,
        title: this.title,
      });

      this.$router.push({ name: 'posts' });
    },
  },

  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>
