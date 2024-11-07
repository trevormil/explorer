import { defineStore } from 'pinia';
import { useBlockchain } from './useBlockchain';

export const useAuthStore = defineStore('authStore', {
  state: () => {
    return {
      addressCount: 0,
    };
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
  },
  actions: {
    initial() {
      this.fetchAddresses();
    },
    async fetchAddresses() {
      try {
        const res = await this.blockchain?.rpc?.getAuthAccounts();
        console.log(res);
        if (res) {
          this.addressCount = Number(res.pagination.total) || 0;
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
});
