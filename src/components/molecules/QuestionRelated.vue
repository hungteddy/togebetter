<template>
  <div class="question-related__box">
    <h5 class="question-related__box__title">{{ title }}</h5>
    <question-simple v-for="item in questions" :question="item" :key="item.id"></question-simple>
  </div>
</template>

<script>
import QuestionSimple from '@/components/atoms/QuestionSimple.vue';
import { db } from '@/firebase';

export default {
  name: 'QuestionRelated',
  components: {
    QuestionSimple,
  },

  props: {
    title: {
      type: String,
      default: 'Related Questions',
    },
    currentQuestionID: {
      type: String,
    },
    lang: {
      type: String,
      default: 'en',
    },
    questionType: {
      type: String,
      default: 'sound-natural',
    },
  },

  data() {
    return {
      questions: [],
    };
  },

  created() {
    db.collection('questions')
      .where('lang', '==', this.lang)
      .where('questionType', '==', this.questionType)
      .where('content', '!=', '')
      .limit(5)
      .get()
      .then((querySnapshot) => {
        const questions = [];
        querySnapshot.forEach((doc) => {
          if (doc.id === this.currentQuestionID) return;

          questions.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        this.questions = questions;
      });
  },
};
</script>
