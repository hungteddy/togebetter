import Vue from 'vue';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import {
  Avatar,
  Button,
  Input,
  Select,
  Option,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Drawer,
  FormItem,
  Form,
  Checkbox,
  Divider,
  Link,
  Tag,
  RadioGroup,
  RadioButton,
  Dialog,
  Row,
  Col,
  Image,
  Upload,
  Tooltip,
  Loading,
  MessageBox,
} from 'element-ui';
import infiniteScroll from 'vue-infinite-scroll';
import VueTimeago from 'vue-timeago';
import App from './App.vue';
import router from './router';
import store from './store';

// CSS
import '@/assets/scss/all.scss';
// iconfont
import '@/assets/fonts/iconfont.css';

// configure language
locale.use(lang);

Vue.prototype.$ELEMENT = { size: 'medium', zIndex: 3000 };
Vue.use(infiniteScroll);

Vue.use(Avatar);
Vue.use(Button);
Vue.use(Input);
Vue.use(Select);
Vue.use(Option);
Vue.use(Drawer);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Checkbox);
Vue.use(Divider);
Vue.use(Link);
Vue.use(Tag);
Vue.use(RadioGroup);
Vue.use(RadioButton);
Vue.use(Dialog);
Vue.use(Row);
Vue.use(Col);
Vue.use(Upload);
Vue.use(Tooltip);
Vue.use(Image);
Vue.use(Loading);
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'en', // Default locale
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
