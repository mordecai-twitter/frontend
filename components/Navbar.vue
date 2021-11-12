<template>
  <c-flex
    justify="space-around"
    align="center"
    h="3em"
    position="fixed"
    w="100vw"
    bg="#16202c"
    top="0"
  >
    <NuxtLink to="/">
      <c-heading size="md">Home</c-heading>
    </NuxtLink>
    <NuxtLink to="/tweets">
      <c-heading size="md">Tweets</c-heading>
    </NuxtLink>
  </c-flex>
</template>
