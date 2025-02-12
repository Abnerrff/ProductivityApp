<template>
  <div class="agenda">
    <h2>Agenda</h2>
    <div v-if="events.length === 0">
      Nenhum evento cadastrado
    </div>
    <ul v-else>
      <li v-for="event in events" :key="event.id">
        {{ event.title }} - {{ event.start_time }}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Agenda',
  computed: {
    ...mapState(['events'])
  },
  methods: {
    ...mapActions(['fetchEvents'])
  },
  created() {
    this.fetchEvents()
  }
}
</script>
