
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

// window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
// import axios from 'axios';

//ElementUI change new b1-t5-1
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import DataTables from 'vue-data-tables' 
// import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/reset.css'
import '../sass/element-variables.scss'
// import '../sass/app.scss';
// import './icons' // icon
// import '../sass/app.scss';
// import 'element-ui/lib/theme-chalk/index.css'
import 'billboard.js/dist/billboard.min.css';




import router from './routes';
//import ClientStatusTable from './views/ClientStatus/ClientStatusTable';
//import NavView from './components/NavView';


import store from './store/SharedStore';

import ECharts from 'vue-echarts';
import BillboardChart from './customplugin/vue-billboard';
import DcRangeChart from './customplugin/vue-dc-range';
import Root from './Root';


// register component to use
Vue.component('v-chart', ECharts)

import JobTimeVis from "./components/JobTimeVis";
Vue.component(JobTimeVis.name, JobTimeVis);


// import i18n from './lang';

// require('es6-promise').polyfill()
Vue.use(Element, { size: 'medium', locale })

Vue.use(DataTables);
Vue.use(VueRouter);
window.Vue = Vue;

Vue.use(BillboardChart);
Vue.use(DcRangeChart);

// import Vuetable from "vuetable-2/src/components/Vuetable";

// VueTify
/*import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
Vue.use(Vuetify);
import BaseLine from './views/Layout/BaseLine';*/


const app = new Vue({
  el: '#app',
  data: {
    privateState: {},
    sharedState: store.state,
    primaryColor: '#409eff',
  },
  template: '<Root/>',
  // components: { App }
  components: {
    // 'nav-view': NavView,
    // NavBar,
    Root
    // BaseLine
  },
  router,
  methods: {
  },
  computed: {},
  events: {},
});
