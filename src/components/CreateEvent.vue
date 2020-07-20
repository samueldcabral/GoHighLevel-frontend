<template>
  <div>
    <img alt="Vue logo" class="app_img" src="./../assets/logo.png" />
    <img alt="Image of girl selecting a date" class="app_imgBg" src="./../assets/booking.svg" />
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
            {{selectedDate ? "Available Starting times for" : "Please Start by selecting a date..."}}
            <strong>{{selectedDate}}</strong>
          </h5>
          <div class="d-flex justify-content-around">
            <div class="AM">
              <div class="AM">AM</div>
              <app-slot
                v-for="item in amSlots"
                v-bind:key="item.title"
                :slotTime="item.title"
                v-bind:class="{selected : selectedSlot === item.title}"
                v-on:click.native="setSlot(item.title)"
              ></app-slot>
            </div>
            <div class="PM">
              <div class="PM">PM</div>
              <app-slot
                v-for="item in pmSlots"
                v-bind:key="item.title"
                :slotTime="item.title"
                v-bind:class="{selected : selectedSlot === item.title}"
                v-on:click.native="setSlot(item.title)"
              ></app-slot>
            </div>
          </div>
        </section>
      </div>
      <div class="app_form">
        <div>
          <label for="range-2" v-bind:class="{'text-muted' : selectedSlot.length === 0 }">
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
            v-bind:class="{notAllow : selectedSlot.length === 0}"
            :disabled="selectedSlot.length === 0"
          ></b-form-input>
        </div>
        <b-button
          variant="outline-success"
          class="mt-3 app_outline-button"
          size="lg"
          v-on:click="$emit('switch-page')"
        >Check Events</b-button>
        <b-button
          variant="success"
          class="mt-3 app_button"
          v-bind:class="{notAllow : selectedSlot.length === 0}"
          size="lg"
          v-on:click="handleSubmit"
          :disabled="selectedSlot.length === 0"
        >Create Event</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment-timezone";
import Timezones from "./../config/Timezones";
import AppSlot from "./../components/AppSlot";
import {
  getEvents,
  getSlots,
  createEvent
  // jsonPlaceholder
} from "./../services/api";

export default {
  name: "AppCreate",
  components: { "app-slot": AppSlot },
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
    // TODO when clicking here, perform an api check?
    handleDatePick: function() {},
    handleSubmit: async function() {
      let DateTime = null;

      if (this.pmSlots.length > 0) {
        DateTime = this.pmSlots.find(item => item.title === this.selectedSlot);
      }

      if (!DateTime && this.amSlots.length > 0) {
        DateTime = this.amSlots.find(item => item.title === this.selectedSlot);
      }

      let toastMessage = {
        title: "",
        message: "",
        variant: ""
      };

      try {
        await this.createApiEvent(
          DateTime.value.format(),
          this.eventCandidateDuration
        );

        toastMessage.title = "Success!";
        toastMessage.message = "Event Created Successfully!";
        toastMessage.variant = "success";

        this.amSlots = this.amSlots.filter(
          item => item.title !== this.selectedSlot
        );
        this.pmSlots = this.pmSlots.filter(
          item => item.title !== this.selectedSlot
        );
        // this.setAvailableDatesOnCalendar();
      } catch (error) {
        toastMessage.title = "Oops, Something wrong happened!";
        toastMessage.message = `Event not created. The error is ${error}`;
        toastMessage.variant = "danger";
      }

      this.displayToast("b-toaster-bottom-center", toastMessage);
    },
    displayToast: function(toaster, toast) {
      this.$bvToast.toast(`${toast.message}`, {
        title: toast.title,
        toaster,
        solid: true,
        variant: toast.variant,
        appendToast: true
      });
    },
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
      const result = await createEvent(DateTime, Duration);
      return result.data;
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
      this.setAvailableDatesOnCalendar();
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  },
  watch: {
    dates: function(val) {
      this.selectedDate = val ? moment(val).format("ddd, MMMM Do YYYY") : "";
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

.notAllow {
  cursor: not-allowed;
}
</style>