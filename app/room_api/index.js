const { DOMAIN } = require('../config');
const {fetch} = require("../helpers/fetch");

const self = module.exports = {
  closeRoom: async(id) => {
    const url = `${DOMAIN}/communicate/room/${id}/update/`;
    return fetch(url, 'put', {active: false});
  },

  getRooms: async() => {
      const url = `${DOMAIN}/communicate/rooms/`;
      return fetch(url);
  },

  clearRooms: async(room, userInfo) => {
    const url = `${DOMAIN}/communicate/rooms/`;
    return fetch(url, 'post', {active: false});
  },

  getMessges: async(room_id) => {
    const url = `${DOMAIN}/communicate/messages/${room_id}`;
    return fetch(url);
  },

  creatMessage: async(room, data, io) => {
    const url = `${DOMAIN}/communicate/message/`;
    return fetch(url, 'post', data);
  },

  createRoom: async(data) => {
    const url = `${DOMAIN}/communicate/room/`;
    return fetch(url, 'post', data);
  },

  getRoom: async(id) => {
    const url = `${DOMAIN}/communicate/room/${id}/get/`;
    return fetch(url, 'get');
  },

  getMember: async(room, userInfo) => {
    const url = `${DOMAIN}/communicate/member/${room}/${userInfo['pk']}`;
    const user_info = JSON.stringify(userInfo);
    return fetch(url);
  },

  createMember: async(room, userInfo) => {
    const url = `${DOMAIN}/communicate/member/`;
    const data = {social_account: userInfo['pk'], room_name: room, active: true}
    return fetch(url, 'post', data);
  },

  hideMember: async(room, userInfo) => {
    const url = `${DOMAIN}/communicate/member/`;
    const user_info = JSON.stringify(userInfo);
    const data = {user_info, active: false, room}
    return fetch(url, 'put', data);
  }
};
