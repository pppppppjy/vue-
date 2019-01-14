import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router.config'
//Less 是一门 CSS 预处理语言，它扩展了 CSS 语言，增加了变量、Mixin、函数等特性，使 CSS 更易维护和扩展。
import Less from 'Less'
//Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中
import axios from 'axios'
import store from './store/'
//图片懒加载
import VueLazyload from 'vue-lazyload'
import App from './App.vue'
import Loading from './components/loading'
require('./assets/css/base.css'); //全局引入
Vue.use(Less);
Vue.use(VueRouter);
Vue.use(Loading);
Vue.use(VueLazyload, {
    preLoad: 1.3,
    error: require('./assets/images/err.png'),
    loading: require('./assets/images/loading.gif'),
    attempt: 1,
    listenEvents: ['scroll']
});
const router = new VueRouter({
    mode: 'history',
    scorllBehavior: () => ({
        y: 0

    }),
    routes
});
//axios的一些配置，比如发送请求显示loading，请求回来loading消失之类的
//
axios.interceptors.request.use(function(config) { //配置发送请求的信息
    store.dispatch('showLoading');
    return config;
}, function(error) {
    return Promise.reject(error);
});

axios.interceptors.response.use(function(response) { //配置请求回来的信息
    store.dispatch('hideLoading');
    return response;
}, function(error) {
    return Promise.reject(error);
});
axios.defaults.baseURL = 'http://localhost:3333/';
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'
Vue.prototype.$http = axios;

// 处理刷新的时候vuex被清空但是用户已经登录的情况
if (window.sessionStorage.userInfo) {
    store.dispatch('setUserInfo', JSON.parse(window.sessionStorage.userInfo));
}

// 登录中间验证，页面需要登录而没有登录的情况直接跳转登录
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (store.state.userInfo.user_id) {
            next();
        } else {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
        }
        console.log("================");
    } else {
        console.log("nnnnnnnnnnnnnnnnnn");
        next();
    }
});
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
