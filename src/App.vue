<template>
  <div>
    <img alt="Vue logo" class="app_img" src="./assets/logo.png" />
    <div id="app" class="d-flex flex-column">
      <div class="d-flex justify-content-center">
        <section class="d-flex flex-column align-items-center app_pick">
          <h5 class="app_title">Pick a Date and Time</h5>
          <vc-date-picker
            v-model="dates"
            mode="single"
            is-inline
            color="green"
            :min-date="new Date()"
          />
          <b-form-select v-model="selected" :options="options" class="mt-2" size="sm"></b-form-select>
        </section>
        <section>
          <h5 class="app_title">
            Available Starting times for
            <strong>Mon, Jul 20, 2020</strong>
          </h5>
          <div class="d-flex justify-content-around">
            <div class="AM">
              <div class="AM">AM</div>
              <app-slot
                :slotTime="item"
                v-for="item in fakeAm"
                v-bind:key="item"
                v-on:click.native="setSlot(item)"
                v-bind:class="{selected : selectedSlot === item}"
              ></app-slot>
            </div>
            <div class="PM">
              <div class="PM">PM</div>
              <app-slot
                v-on:click.native="setSlot(item)"
                :slotTime="item"
                v-for="item in fakePm"
                v-bind:key="item"
                v-bind:class="{selected : selectedSlot === item}"
              ></app-slot>
            </div>
          </div>
        </section>
      </div>
      <div>
        <b-button variant="success" class="mt-5 app_button" size="lg">Select Date</b-button>
      </div>
    </div>
    <div class="test h4">{{dates}}</div>
    <div class="test h4">{{selected}}</div>
    <div class="test h4">{{selectedSlot}}</div>
    <!-- <div class="h5 m-2" v-for="book in apiBookings" v-bind:key="book.id">{{book.id}}</div>
    <hr />
    <div class="h5 m-2" v-for="slot in apiSlots" v-bind:key="slot.id">{{slot.id}}</div>-->
  </div>
</template>

<script>
import Timezones from "./config/Timezones";
import AppSlot from "./components/AppSlot";
import {
  getBookings,
  getSlots,
  createBooking
  // jsonPlaceholder
} from "./services/api";

export default {
  name: "App",
  components: { "app-slot": AppSlot },
  data() {
    return {
      dates: new Date(),
      selected: "UTC",
      options: Timezones,
      fakeAm: ["11:00 AM", "11:30 AM"],
      fakePm: [
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM"
      ],
      selectedSlot: null,
      apiBookings: [],
      apiSlots: []
    };
  },
  methods: {
    setSlot: function(slot) {
      this.selectedSlot = slot;
    },
    getApiBookings: async function(StartDate, EndDate) {
      const result = await getBookings(StartDate, EndDate);
      this.apiBookings = result.data;
    },
    getApiSlots: async function(sendDate, Timezone) {
      const result = await getSlots(sendDate, Timezone);
      this.apiSlots = result.data;
    },
    createApiBooking: async (DateTime, Duration) => {
      return await createBooking(DateTime, Duration);
    }
  },
  mounted: function() {
    try {
      const StartDate = "2020-07-21";
      const EndDate = "2020-07-27";
      this.getApiBookings(StartDate, EndDate);

      const sendDate = "2020-07-22";
      const Timezone = "UTC";
      this.getApiSlots(sendDate, Timezone);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
};
</script>

<style>
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
  opacity: 0.2;
  right: 0;
  bottom: 0;
  margin: 2rem;
  width: 200px;
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
}
</style>
