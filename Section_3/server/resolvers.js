import {createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob} from "./db/jobs.js";
import {getCompany} from "./db/companies.js";
import {GraphQLError} from "graphql";

export const resolvers = {
    Query: {
        jobs: async () => getJobs(),

        job: async (_root, {id}) => {
            const job = await getJob(id);
            if (!job) {
                throw notFoundError("No job found with this id " + id)
            }
            return job;
        },

        company: async (_root, {id}) => {
            const company = await getCompany(id);
            if (!company) {
                throw notFoundError("No company found with this id " + id);
            }

            return company;
        },
    },

    Mutation: {
        createJob: (_root, {input: {description, title}}, {user}) => {
            if (!user) {
                throw unAuthorizedError("Missing authentication");
            }

            return createJob({companyId: user.companyId, title, description})
        },

        deleteJob: async (_root, {id}, {user}) => {
            if (!user) {
                throw unAuthorizedError("Missing authentication");
            }

            const job = await deleteJob(id, user.companyId);
            if (!job) {
                throw notFoundError("No job found with this id " + id)
            }

            return job;
        },

        updateJob: async (_root, {input}, {user}) => {
            if (!user) {
                throw unAuthorizedError("Missing authentication");
            }
            const updJob = await updateJob({...input, companyId: user.companyId});

            if (!updJob) {
                throw notFoundError("No job found with this id " + input.id)
            }
            return updJob;
        }

    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id),
    },

    Job: {
        date: (job) => toIsoDate(job.createdAt),
        company: (job, _args, {companyLoader}) => {
            return companyLoader.load(job.companyId)
        },
    }
}

function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: {code: "NOT_FOUND"},
    })
}

function unAuthorizedError(message) {
    return new GraphQLError(message, {
        extensions: {code: "UNAUTHORIZED"},
    })
}

function toIsoDate(value) {
    return value.slice(0, 'yyyy-mm-dd'.length)
}