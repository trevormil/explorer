<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlockchain, useFormatter } from '@/stores';
import type { DenomMetadata } from '@/types';

const props = defineProps(['chain']);
const route = useRoute();
const router = useRouter();
const chainStore = useBlockchain();
const format = useFormatter();

const baseDenom = ref<string>('');
const displayDenom = ref<string>('');
const symbol = ref<string>('');
const holders = ref<
  { address: string; rawAmount: string; amountDisplay: string }[]
>([]);
const isLoading = ref(false);
const progress = ref<{ pages: number; owners: number }>({
  pages: 0,
  owners: 0,
});

async function load() {
  baseDenom.value = decodeURIComponent(String(route.params.denom || ''));
  const metaRes = await chainStore.rpc.getBankDenomMetadata();
  const md: DenomMetadata | undefined = metaRes.metadatas.find(
    (m: DenomMetadata) => m.base === baseDenom.value
  );
  if (md) {
    displayDenom.value = md.display || baseDenom.value;
    symbol.value = (md as any).symbol || displayDenom.value;
  } else {
    displayDenom.value = baseDenom.value;
    symbol.value = baseDenom.value;
  }
  const cacheKey = `holders_${baseDenom.value}`;
  const cacheTsKey = `${cacheKey}_ts`;
  const now = Date.now();
  const cachedTs = Number(localStorage.getItem(cacheTsKey) || 0);
  if (cachedTs && now - cachedTs < 10 * 60 * 1000) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      holders.value = JSON.parse(cached);
      return;
    }
  }

  isLoading.value = true;
  progress.value = { pages: 0, owners: 0 };
  const all: { address: string; rawAmount: string }[] = [];
  let key: string | undefined = undefined;
  let pages = 0;
  do {
    const res = await chainStore.rpc.getBankDenomOwners(
      baseDenom.value,
      200,
      key
    );
    const owners = (res as any).owners || (res as any).denom_owners || [];
    for (const o of owners) {
      const coin = o.balance ||
        o.coins?.[0] || { amount: '0', denom: baseDenom.value };
      all.push({
        address: o.address || o.owner || '',
        rawAmount: String(coin.amount || '0'),
      });
    }
    key =
      (res as any).pagination?.next_key ||
      (res as any).pagination?.nextKey ||
      undefined;
    pages++;
    progress.value = { pages, owners: all.length };
    await new Promise((r) => setTimeout(r, 0));
  } while (key);
  all.sort((a, b) => {
    try {
      const aa = BigInt(a.rawAmount || '0');
      const bb = BigInt(b.rawAmount || '0');
      return aa === bb ? 0 : aa > bb ? -1 : 1;
    } catch {
      return 0;
    }
  });
  const top = all.slice(0, 100).map((x) => ({
    address: x.address,
    rawAmount: x.rawAmount,
    amountDisplay: BigInt(x.rawAmount || '0')
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  }));
  holders.value = top;
  localStorage.setItem(cacheKey, JSON.stringify(top));
  localStorage.setItem(cacheTsKey, String(now));
  isLoading.value = false;
}

onMounted(load);
watch(() => route.fullPath, load);
</script>

<template>
  <div class="overflow-auto bg-base-100">
    <div class="p-4 flex items-center justify-between">
      <div class="text-xl font-semibold">Top 100 Holders — {{ baseDenom }}</div>
      <button
        class="btn btn-sm"
        @click="$router.push({ path: `/${props.chain}/supply/` })"
      >
        Back to Supply
      </button>
    </div>
    <div class="px-4 pb-2 text-xs opacity-70">
      Note: balances shown in base denom units (0 decimals).
    </div>
    <div v-if="isLoading" class="px-4 pb-2 text-sm opacity-80">
      Loading owners… Pages: {{ progress.pages }} Owners: {{ progress.owners }}
    </div>
    <table class="table table-compact">
      <thead class="bg-base-200">
        <tr>
          <td>#</td>
          <td>Address</td>
          <td>Balance</td>
        </tr>
      </thead>
      <tr v-for="(h, i) in holders" :key="h.address">
        <td>{{ i + 1 }}</td>
        <td>
          <RouterLink
            :to="`/${props.chain}/account/${h.address}`"
            class="link"
            >{{ h.address }}</RouterLink
          >
        </td>
        <td>{{ h.amountDisplay }}</td>
      </tr>
      <tr v-if="!holders.length">
        <td colspan="3" class="text-center py-6">No holders found.</td>
      </tr>
    </table>
  </div>
</template>
