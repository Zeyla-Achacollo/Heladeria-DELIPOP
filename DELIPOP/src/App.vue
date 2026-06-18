<template>
  <DefaultLayout />
</template>

<script setup lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>

<style>
:root {
  font-family: 'Inter', sans-serif;
  background: #f8f2f7;
  color: #2d2d35;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
.btn,
.btn-link {
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
}
button:active,
.btn:active,
.btn-link:active {
  transform: translateY(1px) scale(0.98);
  filter: brightness(0.92);
}
button:focus-visible,
.btn:focus-visible,
.btn-link:focus-visible {
  outline: 3px solid rgba(255, 110, 161, 0.35);
  outline-offset: 3px;
}
</style>
