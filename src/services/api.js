import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3003/api",
});

const getEvents = async (StartDate, EndDate) => {
  return await api.get("/events", {
    params: {
      StartDate,
      EndDate,
    },
  });
};

const getSlots = async (Date, Timezone) => {
  return await api.get("/events/slots", {
    params: {
      Date,
      Timezone,
    },
  });
};

const createEvent = async (DateTime, Duration) => {
  return await api.post("/events", {
    DateTime,
    Duration,
  });
};

export { getEvents, getSlots, createEvent };
