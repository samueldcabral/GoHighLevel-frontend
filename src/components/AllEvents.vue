<template>
  <div>
    <img alt="Vue logo" class="app_img" src="./../assets/logo.png" />
    <p class="h2 events_icon" v-on:click="$emit('switch-page')">
      <b-icon-arrow-left></b-icon-arrow-left>
    </p>
    <div id="app" class="d-flex flex-column">
      <div class="d-flex justify-content-center">
        <section class="d-flex flex-column align-items-center app_pick">
          <h5 class="app_title">Pick a Start and End Date</h5>
          <vc-date-picker
            v-model="range"
            v-on:click.native="handleDatePick(dates)"
            mode="range"
            is-inline
            color="green"
            :first-day-of-week="0"
            locale="en"
          />
          <!-- <vc-date-picker
            v-model="range"
            v-on:click.native="handleDatePick(dates)"
            mode="multiple"
            is-inline
            color="green"
            :available-dates="availableDates"
            :first-day-of-week="0"
            locale="en"
          />-->
        </section>
        <section>
          <h5 class="app_title">
            All events for those dates are here!
            <!-- <strong>{{selectedDate}}</strong> -->
          </h5>
          <div class="d-flex justify-content-around">
            <div class="AM">
              <app-slot
                v-for="item in amSlots"
                v-bind:key="item.title"
                :slotTime="item.title"
                v-bind:class="{selectedTimezone : selectedSlot === item.title}"
                v-on:click.native="setSlot(item.title)"
              ></app-slot>
            </div>
            <div class="PM">
              <app-slot
                v-for="item in pmSlots"
                v-bind:key="item.title"
                :slotTime="item.title"
                v-bind:class="{selectedTimezone : selectedSlot === item.title}"
                v-on:click.native="setSlot(item.title)"
              ></app-slot>
            </div>
          </div>
        </section>
      </div>
      <!-- <div class="app_form">
        <div>
          <label for="range-2" v-bind:class="{'text-muted' : !selectedSlot }">
            How long should your event be?
            <strong>{{eventCandidateDuration}} min</strong>
          </label>
          <b-form-input
            id="range-2"
            v-model="eventCandidateDuration"
            type="range"
            min="15"
            max="60"
            step="5"
            :disabled="!selectedSlot"
          ></b-form-input>
        </div>
        <b-button variant="outline-success" class="mt-3 app_outline-button" size="lg">Check Events</b-button>
        <b-button variant="success" class="mt-3 app_button" size="lg">Create Event</b-button>
      </div>-->
    </div>
    <div class="test h4">{{"dates " + dates}}</div>
    <div class="test h4">{{JSON.stringify(dates)}}</div>
    <div class="test h4">{{selectedTimezone}}</div>
    <div class="test h4">{{selectedSlot}}</div>
    <div class="test h4">{{range}}</div>
  </div>
</template>

<script>
import { BIconArrowLeft } from "bootstrap-vue";
import moment from "moment-timezone";
import Timezones from "./../config/Timezones";
import {
  getEvents,
  getSlots,
  createEvent
  // jsonPlaceholder
} from "./../services/api";

export default {
  name: "AppEvents",
  components: { "": BIconArrowLeft },
  data() {
    return {
      dates: null,
      range: {
        start: new Date(), // Jan 16th, 2018
        end: new Date() // Jan 19th, 2018
      },
      selectedDate: null,
      selectedTimezone: "UTC",
      options: Timezones,
      createEventPage: false,
      eventCandidateDuration: 30,
      amSlots: [],
      pmSlots: [],
      selectedSlot: [],
      apiEvents: [],
      apiFullEvents: [],
      availableDates: [
        {
          start: moment.utc("2020-07-20").format(),
          end: moment.utc("2020-07-20").format()
        },
        {
          start: moment.utc("2020-07-21").format(),
          end: moment.utc("2020-07-21").format()
        },
        {
          start: moment.utc("2020-07-22").format(),
          end: moment.utc("2020-07-22").format()
        }
      ]
    };
  },
  methods: {
    setSlot: function(slot) {
      this.selectedSlot = slot;
    },
    // TODO when clicking here, perform an api check?
    handleDatePick: function() {},
    setAvailableDatesOnCalendar: async function() {
      const Timezone = "UTC";
      await this.getApiSlots(-1, Timezone); //the number -1 is to fetch all slots in the db

      if (this.apiFullEvents.length > 0) {
        let availableDatesArr = [];

        for (let slot of this.apiFullEvents) {
          let momentDate = moment(slot.StartHours).format();

          availableDatesArr.push({
            start: momentDate,
            end: momentDate
          });
        }

        this.availableDates = availableDatesArr;
      }
    },

    getApiEvents: async function(StartDate, EndDate) {
      const result = await getEvents(StartDate, EndDate);
      this.apiEvents = result.data;
    },
    getApiSlots: async function(sendDate, Timezone) {
      const result = await getSlots(sendDate, Timezone);
      this.apiFullEvents = result.data;
    },
    createApiEvent: async (DateTime, Duration) => {
      return await createEvent(DateTime, Duration);
    },
    computeSlots: function(val) {
      let slotsInTheAM = [];
      let slotsInThePM = [];

      this.apiFullEvents.forEach(event => {
        let startHoursMoment = moment(event.StartHours);
        let valMoment = moment(val);
        startHoursMoment.tz(this.selectedTimezone);
        valMoment.tz(this.selectedTimezone);
        let copyOfValMoment = moment(valMoment);
        let valMomentTomorrow = moment(copyOfValMoment.add(1, "day"));
        copyOfValMoment = moment(valMoment);
        let valMomentYesterday = moment(copyOfValMoment.subtract(1, "day"));

        if (
          startHoursMoment.isSame(valMoment, "day") ||
          startHoursMoment.isSame(valMomentTomorrow, "day") ||
          startHoursMoment.isSame(valMomentYesterday, "day")
        ) {
          event.Slots.forEach(slot => {
            let slotMoment = moment(slot);
            slotMoment.tz(this.selectedTimezone);

            let isAm = true;
            let minutes = slotMoment.minutes();
            let hour = slotMoment.hour();

            if (slotMoment.hour() >= 12) {
              hour = hour - 12;
              hour = hour === 0 ? 12 : hour;
              isAm = false;
            }

            let slotFormatted = `${hour
              .toString()
              .padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${
              isAm ? "AM" : "PM"
            }`;

            if (slotMoment.isSame(valMoment, "day")) {
              if (isAm) {
                slotsInTheAM.push({ title: slotFormatted, value: slotMoment });
              } else {
                slotsInThePM.push({ title: slotFormatted, value: slotMoment });
              }
            }
          });
        }
      });

      this.amSlots = slotsInTheAM;
      this.pmSlots = slotsInThePM;
    }
  },
  mounted: function() {
    try {
      // const StartDate = "2020-07-21";
      // const EndDate = "2020-07-27";
      // this.getApiEvents(StartDate, EndDate);

      // const sendDate = "2020-07-22";

      this.setAvailableDatesOnCalendar();
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  },
  watch: {
    dates: function(val) {
      this.selectedDate = moment(val).format("ddd, MMMM Do YYYY");
      this.computeSlots(val, this.selectedTimezone);
    },
    selectedTimezone: function(val) {
      this.computeSlots(this.dates, val);
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