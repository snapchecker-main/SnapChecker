import api from "../client";

export const classroomApi = {

    async getAll() {
        const { data } = await api.get("/classrooms/");
        return data;
    },

    async getById(id) {
        const { data } = await api.get(`/classrooms/${id}`);
        return data;
    },

    async create(payload) {
        const { data } = await api.post("/classrooms/", payload);
        return data;
    },

    async update(id, payload) {
        const { data } = await api.put(`/classrooms/${id}`, payload);
        return data;
    },

    async remove(id) {
        const { data } = await api.delete(`/classrooms/${id}`);
        return data;
    },

};