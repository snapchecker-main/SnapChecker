import api from "../client";

export const rosterApi = {
  async get(classroomId) {
    const { data } = await api.get(`/roster/class/${classroomId}`);
    return data;
  },

  async add(classroomId, payload) {
    const { data } = await api.post(`/roster/class/${classroomId}`, payload);
    return data;
  },

  async addBulk(classroomId, payload) {
    const { data } = await api.post(
      `/roster/bulk/class/${classroomId}`,
      payload,
    );
    return data;
  },

  async update(studentId, payload) {
    const { data } = await api.put(`/roster/student/${studentId}`, payload);
    return data;
  },

  async remove(studentId) {
    const { data } = await api.delete(`/roster/student/${studentId}`);
    return data;
  },

  async clear(classroomId) {
    const { data } = await api.delete(`/roster/class/${classroomId}`);
    return data;
  },
};
