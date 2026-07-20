import api from "../client";

export const gradebookApi = {

    async get(classroomId) {
        const { data } = await api.get(
            `/scans/classroom/${classroomId}`
        );

        return data;
    },

    async getSemester(classroomId) {
        const { data } = await api.get(
            `/classrooms/${classroomId}/semester-gradebook`
        );

        return data;
    },

    async deleteScan(scanId) {
        const { data } = await api.delete(
            `/scans/${scanId}`
        );

        return data;
    },

};