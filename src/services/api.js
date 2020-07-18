import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3003/api",
});

const getBookings = async (StartDate, EndDate) => {
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

const createBooking = async (DateTime, Duration) => {
  return await api.post("/events", {
    DateTime,
    Duration,
  });
};

const jsonPlaceholder = async () => {
  return await axios.get("https://jsonplaceholder.typicode.com/todos/1");
};

export { getBookings, getSlots, createBooking, jsonPlaceholder };
