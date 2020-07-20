<template>
  <div class="slot">{{slotTime}}</div>
</template>

<script>
export default {
  name: "AppSlot",
  props: {
    slotTime: String
  }
  // methods: {
  //   setSlot: function(slot) {
  //     alert(slot);
  //   }
  // }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.slot {
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  margin: 10px 5px;
  padding: 7px 40px;
  font-size: 0.9rem;
  color: rgb(100, 100, 100);
}

.slot:hover {
  background-color: #eefff5;
  border-color: #97dab3;
  cursor: pointer;
}

.selected {
  background-color: #38a169 !important;
  color: white;
}
</style>
