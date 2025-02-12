<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/agenda">Agenda</router-link>
      <router-link to="/pomodoro">Pomodoro</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
