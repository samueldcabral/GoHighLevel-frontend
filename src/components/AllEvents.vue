<template>
  <div>
    <img alt="Vue logo" class="app_img" src="./../assets/logo.png" />
    <img alt="Image of girl selecting a date" class="app_imgBg" src="./../assets/booking.svg" />
    <p class="h2 events_icon" v-on:click="$emit('switch-page')">
      <b-icon-arrow-left></b-icon-arrow-left>
    </p>
    <div id="app" class="d-flex flex-column">
      <div class="d-flex justify-content-center">
        <section class="d-flex flex-column align-items-center app_pick">
          <h5 class="app_title">Pick a Start and End Date</h5>
          <vc-date-picker
            v-model="range"
            mode="range"
            is-inline
            color="green"
            :first-day-of-week="0"
            locale="en"
          />
        </section>
        <section>
          <h5 class="app_title">
            All events for
            <strong>{{rangeFormatted}}</strong> are here!
          </h5>
          <div class="d-flex flex-column justify-content-around">
            <app-slot v-for="item in bookedEvents" v-bind:key="item" :slotTime="item"></app-slot>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconArrowLeft } from "bootstrap-vue";
import moment from "moment-timezone";
import { getEvents } from "./../services/api";
import AppSlot from "./../components/AppSlot";

export default {
  name: "AppEvents",
  components: { "app-slot": AppSlot, "b-icon-arrow-left": BIconArrowLeft },
  data() {
    return {
      range: {
        start: new Date(), // Jan 16th, 2018
        end: new Date() // Jan 19th, 2018
      },
      amSlots: [],
      apiEvents: [],
      apiFullEvents: []
    };
  },
  methods: {
    getApiEvents: async function(StartDate, EndDate) {
      const result = await getEvents(StartDate, EndDate);
      this.apiEvents = result.data;
    },
    getRangeMoment: function(start, end) {
      return {
        start: moment(start),
        end: moment(end)
      };
    }
  },
  computed: {
    rangeFormatted: function() {
      let rangeMoment = this.getRangeMoment(this.range.start, this.range.end);

      return `${rangeMoment.start.format(
        "MMMM Do YYYY"
      )} until ${rangeMoment.end.format("MMMM Do YYYY")}`;
    },
    bookedEvents: function() {
      let arr = [];
      this.apiEvents.map(event => {
        if (event) {
          return event.bookings.map(booking =>
            arr.push(
              moment(booking.DateTime)
                .utc()
                .format("MMMM, Do YYYY [at] HH:mm A [(GMT-00:00)]")
            )
          );
        }
      });

      return arr.sort();
    }
  },
  watch: {
    range: function() {
      let rangeMoment = this.getRangeMoment(this.range.start, this.range.end);
      this.getApiEvents(
        rangeMoment.start.format("YYYY-MM-DD"),
        rangeMoment.end.format("YYYY-MM-DD")
      );
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap");
#app {
  font-family: "Montserrat", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}

.app_img {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  margin: 1rem auto;
  opacity: 0.2;
  z-index: -2;
}

.app_imgBg {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  width: 650px;
  margin: 1rem auto;
  opacity: 0.1555;
  z-index: -2;
}

.app_pick {
  margin-right: 6rem;
}

.app_title {
  margin-bottom: 2rem;
}

.app_button {
  background-color: #38a169 !important;
  border-color: #38a169;
  margin: 0 1rem;
}

.app_button:hover {
  background-color: #55c087 !important;
  border-color: #55c087 !important;
}

.app_outline-button {
  color: #38a169 !important;
  border-color: #38a169 !important;
}

.app_outline-button:hover {
  color: white !important;
  border-color: #38a169 !important;
  background-color: #38a169 !important;
}

.app_form {
  margin: 2rem auto;
}

.events_icon {
  position: absolute;
  top: 0;
  margin-left: 5px;
}

.events_icon:hover {
  color: #38a169;
  cursor: pointer;
}
</style>