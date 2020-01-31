<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>JEXIA </span>
        <span class="font-weight-light">Data Viewer</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-content>
      <Dashboard/>
    </v-content>
  </v-app>
</template>

<script>
import Dashboard from './components/Dashboard';

export default {
  name: 'App',
  components: {
    Dashboard,
  },
  data: () => ({
    //
  }),
  beforeCreate() {
		this.$store.commit('initialiseStore');
	}
};
</script>
