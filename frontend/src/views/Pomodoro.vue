<template>
  <div class="pomodoro">
    <h2>Sessões Pomodoro</h2>
    <div v-if="pomodoroSessions.length === 0">
      Nenhuma sessão Pomodoro iniciada
    </div>
    <ul v-else>
      <li v-for="session in pomodoroSessions" :key="session.id">
        Início: {{ session.start_time }} - 
        Duração: {{ session.work_duration }} minutos
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Pomodoro',
  computed: {
    ...mapState(['pomodoroSessions'])
  },
  methods: {
    ...mapActions(['fetchPomodoroSessions'])
  },
  created() {
    this.fetchPomodoroSessions()
  }
}
</script>
