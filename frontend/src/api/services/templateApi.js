import api from "../client";

export const templateApi = {

    async get(id) {
        const { data } = await api.get(`/templates/${id}`);
        return data;
    },

    async create(payload) {
        const { data } = await api.post("/templates", payload);
        return data;
    },

    async update(id, payload) {
        const { data } = await api.put(`/templates/${id}`, payload);
        return data;
    },

    async remove(id) {
        const { data } = await api.delete(`/templates/${id}`);
        return data;
    },

    async saveAnswerKey(id, answerKey) {
        const { data } = await api.put(
            `/templates/${id}/answer_key`,
            {
                answer_key: answerKey,
            }
        );

        return data;
    },

};