<template>
  <div class="container">
      <c-flex direction="column" align="center">
            <c-heading as="h1" size="2xl">Mordecai</c-heading>
            <c-heading as="h2" size="md">A Twitter tracker for every taste</c-heading>
            <c-image :src="require('~/assets/img/Mordecai.svg')" size="md"></c-image>
      </c-flex>
  </div>
</template>

<style scoped>
    .container {
        margin-top: 10em;
    }
</style>
