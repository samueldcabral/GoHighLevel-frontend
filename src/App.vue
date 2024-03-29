<template>
  <div v-if="page === 'CreateEvent'">
    <app-create v-on:switch-page="handleSwitchPage"></app-create>
  </div>

  <div v-else>
    <app-events v-on:switch-page="handleSwitchPage"></app-events>
  </div>
</template>

<script>
import moment from "moment-timezone";
import Timezones from "./config/Timezones";
import AppEvents from "./components/AllEvents";
import AppCreate from "./components/CreateEvent";
import { getEvents, getSlots, createEvent } from "./services/api";

export default {
  name: "App",
  components: {
    "app-events": AppEvents,
    "app-create": AppCreate
  },
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
      page: "CreateEvent",
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
    handleSwitchPage: function() {
      this.page = this.page === "AllEvents" ? "CreateEvent" : "AllEvents";
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
</style>
