import api from "../client";

export const scannerApi = {

    async scan(formData) {
        const { data } = await api.post(
            "/scans/scan",
            formData
        );

        return data;
    },

    async getOverview(templateId) {
        const { data } = await api.get(
            `/scans/template/${templateId}/overview`
        );

        return data;
    },

    async getItemAnalysis(templateId) {
        const { data } = await api.get(
            `/scans/template/${templateId}/item-analysis`
        );

        return data;
    },

};