<template>
  <div>
    <div class="mb-16">
      <el-button size="large" class="w-100 btn--google" round @click="logInWithGoogle">
        <span class="center">
          <img
            src="https://cdn.svgporn.com/logos/google-icon.svg"
            alt="google"
            width="16"
            height="16"
            class="mr-16"
          />
          Continue with Google
        </span>
      </el-button>
    </div>
    <div class="mb-16">
      <el-button size="large" class="w-100 btn--facebook" round @click="logInWithFacebook">
        <span class="center">
          <img
            src="https://cdn.svgporn.com/logos/facebook.svg"
            alt="google"
            width="16"
            height="16"
            class="mr-16"
          />
          Continue with Facebook
        </span>
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  auth,
  db,
  database,
  GoogleAuthProvider,
  FacebookAuthProvider,
  FieldValue,
} from '@/firebase';

export default {
  data() {
    return {
      countryCode: 'US',
    };
  },

  async created() {
    const response = await fetch('https://extreme-ip-lookup.com/json/').then((res) => res.json());
    const { countryCode } = response;
    this.countryCode = countryCode;
  },

  methods: {
    async logInWithGoogle() {
      const provider = new GoogleAuthProvider();
      auth
        .signInWithPopup(provider)
        .then((result) => {
          const { uid, email, displayName, photoURL } = result.user;
          const userRef = db.collection('users').doc(uid);
          userRef.get().then(async (doc) => {
            if (doc.exists) {
              this.$router.replace({ name: 'home' });
            } else {
              const user = {
                photoURL,
                username: displayName,
                nativeLanguage: 'en',
                interestLanguage: 'en',
                interestLanguageLevel: 'beginner',
                knowingCountry: this.countryCode || 'US',
                interestCountry: 'US',
              };
              // Save to Firestore
              await userRef.set({
                email,
                id: uid,
                points: 0,
                totalAnswers: 0,
                totalQuestions: 0,
                bio: '',
                createdAt: FieldValue.serverTimestamp(),
                ...user,
              });
              database.ref(`users/${uid}`).set({
                ...user,
              });
              this.$router.replace({ name: 'home' });
            }
          });
        })
        .catch((error) => {
          const { code, message, email, credential } = error;
          console.log(code, message, email, credential);
        });
    },

    logInWithFacebook() {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      auth.signInWithPopup(provider).then((result) => {
        const token = result.credential.accessToken;
        const { uid, email, displayName, photoURL } = result.user;
        const userRef = db.collection('users').doc(uid);
        userRef
          .get()
          .then(async (doc) => {
            if (doc.exists) {
              this.$router.replace({ name: 'home' });
            } else {
              const user = {
                photoURL: `${photoURL}?access_token=${token}`,
                username: displayName,
                nativeLanguage: 'en',
                interestLanguage: 'en',
                interestLanguageLevel: 'beginner',
                knowingCountry: this.countryCode || 'US',
                interestCountry: 'US',
              };
              // Save to Firestore
              await userRef.set({
                email,
                id: uid,
                points: 0,
                totalAnswers: 0,
                totalQuestions: 0,
                bio: '',
                createdAt: FieldValue.serverTimestamp(),
                ...user,
              });
              database.ref(`users/${uid}`).set({
                ...user,
              });
              this.$router.replace({ name: 'home' });
            }
          })
          .catch((error) => {
            const { code, message, email, credential } = error;
            console.log(code, message, email, credential);
          });
      });
    },
  },
};
</script>