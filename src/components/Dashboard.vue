<template>
  <div>
  <v-data-table
    :headers="withAction(fields)"
    :items="data"
    sort-by="calories"
    class="elevation-1"
    fixed-header
    height="600px"
  >
    <template v-slot:top>
      <v-card class="mx-auto">
        <v-card-title>
          <v-btn icon @click="show = !show">
            <v-icon>{{ show ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
          </v-btn>
          <div>Configuration</div>
        </v-card-title>

        <v-expand-transition>
          <div v-show="show">
            <v-card-text>
             <v-row>
              <v-col cols="12" sm="6" md="3">
              <v-text-field label="Project ID" v-model="project_id"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
              <v-text-field label="API Key" v-model="api_key"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
              <v-text-field label="APY Secret" v-model="api_secret"></v-text-field>
              </v-col>
              </v-row>
              
              <v-row>
              <v-col cols="12" sm="4" md="2">
              <v-text-field label="DataSet" v-model="resource"></v-text-field>
              </v-col>
              <v-col cols="12" sm="8" md="10">
               <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-combobox
                v-model="fields"
                :item="fields"
                :search-input.sync="search"
                hide-selected
                label="Select fields to show: "
                multiple
                persistent-hint
                small-chips
                clearable
                v-on="on"
              >
              </v-combobox>
      </template>
      <span>Type fields name what you want to see</span>
    </v-tooltip>
              
              
              </v-col>  
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" dark class="mb-2" @click="load">Get data</v-btn>
            </v-card-actions>
          </div>
        </v-expand-transition>
      </v-card>

      <v-toolbar flat color="white" class="pt-5">
        <div class="flex-grow-1"></div>

        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container fluid>
                <vue-json-editor v-model="editedItem" :show-btns="false" :mode="'code'" >
                </vue-json-editor>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="add">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">fa-edit</v-icon>
      <v-icon small @click="deleteItem(item)">fa-trash-alt</v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="load">Reset</v-btn>
    </template>
  </v-data-table>
  <v-snackbar
      v-model="isError"
      top
      color="error"
      :timeout="timeout"
    >
      {{ msg }}
    </v-snackbar>
    </div>
</template>

<script>
 import vueJsonEditor from 'vue-json-editor'

export default {
  
  components: {vueJsonEditor},
  
  data: () => ({
    dialog: false,
    timeout: 6000,
    show: true,
    search:'',
    editedItem:{},
    editedIndex: null,
    defaultItem:{
        name: 'Jumo',
        password: '123456',
        email: 'base@mail.com',
      },
    mySchema: {
        name: { type: 'text', label: 'Name' },
        password: { type: 'password', label: 'Password' },
        email: { type: 'email', label: 'Email' }
      },
  }),

  computed: {
    data() {
      return this.$store.getters.getData;
    },
    msg() {
      return this.$store.getters.ErrorMsg;
    },
    isError: {
       get: function() {
        return this.$store.getters.isError;
       },
       set: function(newValue) {
        this.$store.commit("noError");
      }
    },
    resource: {
      get: function() {
        return this.$store.getters.getRecource;
      },
      set: function(newValue) {
        this.$store.commit("saveProjectID",{key:"res",val:newValue});
      }
    },
    fields: {
      // getter
      get: function() {
        return this.$store.getters.getFields;
      },
      // setter
      set: function(newValue) {
         let names=[]
         
         newValue.forEach(element => {
           if (typeof element==='object') {
             names.push({
               text:element.text,
               value:element.value
             })
           } else {
             names.push({
               text:element,
               value:element
             })
           }
         });
        this.$store.commit("changeFields",names);
      } 
    },
    project_id: { 
      get: function() {
        return this.$store.getters.getProjectID;
      },
      set: function(newValue) {
        this.$store.commit("saveProjectID",{key:"prj",val:newValue});
      }
    },
    api_key: {
      get: function() {
        return this.$store.getters.getAPIKey;
      },
      set: function(newValue) {
        this.$store.commit("saveProjectID",{key:"api",val:newValue});
      }
    },
    api_secret: {
      get: function() {
        return this.$store.getters.getAPISecret;
      },
      set: function(newValue) {
          this.$store.commit("saveProjectID",{key:"sec",val:newValue});
      }
    },
    formTitle() {
      return this.editedIndex == null ? "New Item" : "Edit Item";
    },
    defObject :  {
      get: function() {
        let schema = this.$store.getters.getDefObject
        return schema
      },      
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.editedItem=this.defaultItem
  },

  mounted() {
  },
  
  methods: {
    withAction(fields) {
      return [...fields,...[{ text: 'Actions', value: 'action', sortable: false }]]
    },
    load() {
      this.$store.dispatch("load");
    },
    
    add() {
      if(this.editedIndex==null) this.$store.dispatch("insert",this.editedItem)
      else this.$store.dispatch("update",this.editedItem);
      this.close()   
    },
    
    editItem(item) {
      this.editedIndex = item.id;
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      confirm("Are you sure you want to delete this item?")&&
      this.$store.dispatch("delete",item.id)
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = null;
      }, 300);
    }
  }
};
</script>
