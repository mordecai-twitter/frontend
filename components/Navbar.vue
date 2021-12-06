<template>
  <c-flex
    justify="space-around"
    align="center"
    h="3em"
    position="fixed"
    w="100vw"
    bg="#16202c"
    top="0"
    zIndex="2000"
  >
    <NuxtLink to="/">
      <c-heading size="md">Home</c-heading>
    </NuxtLink>
    <NuxtLink to="/tweets">
      <c-heading size="md">Tweets</c-heading>
    </NuxtLink>
    <NuxtLink to="/contest">
      <c-heading size="md">Contest</c-heading>
    </NuxtLink>
    <NuxtLink to="/trivia">
      <c-heading size="md">Trivia</c-heading>
    </NuxtLink>
  </c-flex>
</template>
