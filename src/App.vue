<template>
  <div>
    <img alt="Vue logo" class="app_img" src="./assets/logo.png" />
    <div id="app" class="d-flex flex-column">
      <div class="d-flex justify-content-center">
        <section class="d-flex flex-column align-items-center app_pick">
          <h5 class="app_title">Pick a Date and Time</h5>
          <vc-date-picker
            v-model="dates"
            v-on:click.native="handleDatePick(dates)"
            mode="single"
            is-inline
            color="green"
            :available-dates="availableDates"
            :first-day-of-week="0"
            locale="en"
          />
          <b-form-select v-model="selectedTimezone" :options="options" class="mt-2" size="sm"></b-form-select>
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
                v-for="item in amSlots"
                v-bind:key="item.title"
                :slotTime="item.title"
                v-bind:class="{selectedTimezone : selectedSlot === item.title}"
                v-on:click.native="setSlot(item.title)"
              ></app-slot>
            </div>
            <div class="PM">
              <div class="PM">PM</div>
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
      <div>
        <b-button variant="success" class="mt-5 app_button" size="lg">Select Date</b-button>
      </div>
    </div>
    <div class="test h4">{{"dates " + dates}}</div>
    <div class="test h4">{{selectedTimezone}}</div>
    <div class="test h4">{{selectedSlot}}</div>
    <!-- <div class="h5 m-2" v-for="book in apiEvents" v-bind:key="book.id">{{book.id}}</div>
    <hr />
    <div class="h5 m-2" v-for="slot in apiFullEvents" v-bind:key="slot.id">{{slot.id}}</div>-->
  </div>
</template>

<script>
import moment from "moment-timezone";
import Timezones from "./config/Timezones";
import AppSlot from "./components/AppSlot";
import {
  getEvents,
  getSlots,
  createEvent
  // jsonPlaceholder
} from "./services/api";

export default {
  name: "App",
  components: { "app-slot": AppSlot },
  data() {
    return {
      dates: null,
      selectedTimezone: "UTC",
      options: Timezones,
      amSlots: [],
      pmSlots: [],
      selectedSlot: null,
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
  top: 50%;
  right: 0;
  left: 0;
  width: 200px;
  margin: 0 auto;
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
}
</style>
