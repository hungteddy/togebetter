<template>
  <div id="app">
    <navbar></navbar>
    <div :class="[!hideSidebar && ['container', 'd-flex', 'p-0']]">
      <div :class="[!hideSidebar && 'left-sidebar']" v-if="!hideSidebar">
        <left-sidebar></left-sidebar>
      </div>
      <div class="main-layout" v-loading="loading">
        <transition name="page-transition" mode="out-in">
          <keep-alive :include="['Home', 'Users']">
            <router-view :key="$route.params.id"></router-view>
          </keep-alive>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/organisms/Navbar.vue';
import LeftSidebar from '@/components/molecules/LeftSidebar.vue';
import { auth, db } from '@/firebase';

export default {
  name: 'App',
  components: {
    Navbar,
    LeftSidebar,
  },

  data() {
    return {
      blackList: ['landing-page', 'login', 'signup', 'account-recovery', 'account-banned'],
      loading: false,
      unsubcribe: null,
    };
  },

  computed: {
    hideSidebar() {
      return this.blackList.includes(this.$route.name);
    },

    notifications() {
      return this.$store.state.ui.notifications;
    },

    interfaceLanguage() {
      return this.$store.state.ui.interfaceLanguage;
    },
  },

  created() {
    this.$i18n.locale = this.interfaceLanguage;

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.loading = true;
        await db
          .collection('users')
          .doc(user.uid)
          .onSnapshot((doc) => {
            const userData = {
              id: user.uid,
              ...doc.data(),
            };
            if (userData.status !== 'active') {
              this.$store.dispatch('auth/signOut');
              this.$router.push({ name: 'account-banned' });
            }
            this.$store.commit('auth/saveUser', { ...userData });
            localStorage.setItem('user', JSON.stringify(userData));
          });
        this.unsubcribe = await db
          .collection('notifications')
          .where('receiveID', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .onSnapshot((snapshot) => {
            const notifications = [];
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'modified') {
                console.log('modified');
              }
            });

            snapshot.forEach((doc) => {
              notifications.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            this.$store.dispatch('ui/fetchNotifications', notifications);
          });
        this.loading = false;
      } else {
        this.$store.commit('ui/removeNotifications');
        this.$store.dispatch('auth/signOut');
      }
    });
  },

  async mounted() {
    const response = await fetch(
      'https://api.ipdata.co?api-key=a6e846e2cf99d84c3bc1636f68fefbc3fb0bc9c18ac79971b99f4741',
    ).then((res) => res.json());
    // eslint-disable-next-line camelcase
    const { country_code, languages } = response;
    // eslint-disable-next-line camelcase
    this.$store.commit('ui/changeCountryCode', country_code);

    if (this.$store.state.ui.languageCode) return;

    this.$store.dispatch('ui/changeLanguageCode', languages[0].name);
  },

  beforeDestroy() {
    if (this.unsubcribe) this.unsubcribe();
  },
};
</script>
