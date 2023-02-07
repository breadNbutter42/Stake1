<script setup>
import IconTwitter from "@/assets/icons/twitter.svg";
import IconDiscord from "@/assets/icons/discord.svg";
import IconBrain from "@/assets/icons/brain.svg";

const socials = [

  {
    icon: IconTwitter,
    href: "https://twitter.com/CerveauAI",
  },
  {
    icon: IconBrain,
    href: "https://cerveauai.com/",
  },
  {
    icon: IconDiscord,
    href: "https://discord.gg/N3KV523e2Q",
  },  
];
</script>

<template>
  <div class="inline-flex items-center gap-6">
    <a
      v-for="({ href, icon }, index) in socials"
      :key="index"
      :href="href"
      target="_blank"
      class="text-white transition hover:text-white/70 active:text-white"
    >
      <component :is="icon" class="w-6 h-6" />
    </a>
  </div>
</template>
