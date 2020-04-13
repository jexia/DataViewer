import Vue from 'vue'
import Vuex from 'vuex'
import { jexiaClient, dataOperations, field } from "jexia-sdk-js/browser";

const ds = dataOperations()

Vue.use(Vuex)

let store = new Vuex.Store({
  state: {
    error:false,
    msg:"",
    data: [],
    fields:[
      { text: "id", value: "id" },
      { text: "created_at", value: "created_at" },
      { text: "updated_at", value: "updated_at" }
    ],
    defObject:{
        name: { type: 'text', label: 'Name', flex: 12},
        password: { type: 'password', label: 'Password' },
        email: { type: 'email', label: 'Email'},
    },
    cfg: {
      projectID: "", 
      key:"", 
      secret:"",
      resource:''
    }
  },

  mutations: {
    initialiseStore(state) {
			// Check if the ID exists
			if(localStorage.getItem('jexia')) {
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('jexia')))
				);
			}
		},
    init(state, data) {
      state.data = data
    },
    error(state, msg) {
      state.error=true
      state.msg=msg
    },
    noError(state, msg) {
      state.error=false
      state.msg=""
    },
    insert(state, record) {
      state.data=[...state.data,...record]  
    },
    update(state, record) {
      state.data = state.data.map(obj => record.find(o => o.id === obj.id) || obj); 
    },
    delete(state, record) {
      for( var i=state.data.length - 1; i>=0; i--){
        for( var j=0; j<record.length; j++){
            if(state.data[i] && (state.data[i].name === record[j].name)){
              state.data.splice(i, 1);
           }
         }
     }
    },
    changeFields(state, data) {
      data.forEach(element => {
          var key = element.text
          state.defObject[key]={type:'text', label:element.text}
      });
            
      state.fields = data
    },
    saveProjectID(state,data) {
      switch(data.key) {
        case "res":
          state.cfg.resource = data.val 
          break;
        case "prj":
          state.cfg.projectID = data.val
          break;
        case "api":
          state.cfg.key = data.val  
          break;
        case "sec":
          state.cfg.secret = data.val
          break;
        default:
          console.log("nothing was updated")
      }
    },
  },

  actions: {
    load(context) {
      let credentials={
        projectID: context.state.cfg.projectID,
        secret:context.state.cfg.secret,
        key:context.state.cfg.key
      }
      
      jexiaClient().init(credentials, ds)

      ds.dataset(context.state.cfg.resource).select().subscribe(
        data => {
          context.commit("init", data)
        },
        error => {
          context.commit("error", error.message)
        }
      )
      
    },
    insert(context,record) {
      ds.dataset(context.state.cfg.resource).insert(record).subscribe(
        data => {
          context.commit("insert", data)
        },
        error => {
          context.commit("error", error.message)
        }
      )
    },
    update(context,record) { 
      ds.dataset(context.state.cfg.resource).update(record).subscribe(
        data => {
          context.commit("update", data)
        },
        error => {
          context.commit("error", error.message)
        }
      )
      
    },
    delete(context,id) { 
      ds.dataset(context.state.cfg.resource).delete().where(field("id").isEqualTo(id)).subscribe(
        data => {
          context.commit("delete", data)
        },
        error => {
          context.commit("error", error.message)
        }
      )
      
    },
  },
  getters: {
    isError: state => {
      return state.error
    },
    ErrorMsg: state => {
      return state.msg
    },
    getData: state => {
      return state.data
    },
    getRecource: state => {
      return state.cfg.resource
    },
    getFields: state => {
      return state.fields
    },
    getProjectID: state => {
      return state.cfg.projectID
    },
    getAPIKey: state => {
      return state.cfg.key
    },
    getAPISecret: state => {
      return state.cfg.secret
    },
    getDefObject: state => {
      let res={}
      state.fields.forEach(element => {
          var key = element.text
          res[key]={type:'text', label:element.text}
      })
      return res
    },
    
  }
})

store.subscribe((mutation, state) => {
  if(mutation.type==="saveProjectID"||mutation.type==="changeFields") {
    let toSave= {
        fields:state.fields,
        defObject:state.defObject,
        cfg:state.cfg
      }
    localStorage.setItem('jexia', JSON.stringify(toSave));
  }
})

export default store
