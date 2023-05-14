import {ApolloClient, ApolloLink, concat, createHttpLink, gql, InMemoryCache} from "@apollo/client";
import {getAccessToken} from "../auth";

// const client = new GraphQLClient("http://localhost:9000/graphql", {
//     headers: () => {
//         const accessToken = getAccessToken();
//         if(accessToken) {
//             return {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         }
//         return {}
//     }
// });

const httpLink = createHttpLink({uri: 'http://localhost:9000/graphql'})

const customLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken();

    if (accessToken) {
        operation.setContext({
            headers: {'Authorization': `Bearer ${accessToken}`}
        })
    }

    return forward(operation)
})


const jobDetailFragment = gql`
    fragment JobDetail on Job {
        id
        date
        title
        company {
            id
            name
        }
        description
    }
`;

export const jobByIdQuery = gql`
    query JobById($id: ID!) {
        job(id: $id) {
           ...JobDetail
        }
    }
    ${jobDetailFragment}
`

export const jobsQuery = gql`
    query Jobs($limit:Int, $offset: Int ) {
        jobs(limit: $limit, offset: $offset) {
            items {
                title
                id
                date
                company {
                    id
                    name
                }
            }
            totalCount
        }
    }
`;

export const companyByIdQuery = gql`
    query($companyId: ID!) {
        company(id: $companyId) {
            id
            description
            name
            jobs {
                id
                date
                title
            }
        }
    }
`;

export const createJobMutation = gql`
    mutation createJob($input: CreateJobInput!) {
        job:createJob(input: $input) {
            ... JobDetail
        }
    }
    ${jobDetailFragment}
`

export const apolloClient = new ApolloClient({
    link: concat(customLink, httpLink),
    cache: new InMemoryCache(),
    // defaultOptions: {
    //     query: {
    //         fetchPolicy: 'network-only'
    //     },
    //     watchQuery: {
    //         fetchPolicy: 'network-only'
    //     }
    // }
})

// export async function getCompany(companyId) {
//     const query = gql`
//         query($companyId: ID!) {
//             company(id: $companyId) {
//                 id
//                 description
//                 name
//                 jobs {
//                     id
//                     date
//                     title
//                 }
//             }
//         }
//     `
//
//     const {data: {company}} = await apolloClient.query({
//         query,
//         variables: {
//             companyId
//         }
//     })
//
//     return company;
// }

// export async function getJob(id) {
//
//     const {data: {job}} = await apolloClient.query({
//         query: jobByIdQuery,
//         variables: {
//             id
//         }
//     })
//
//     return job;
// }

// export async function getJobs() {
//     const query = gql`
//         query Jobs {
//             jobs {
//                 title
//                 id
//                 date
//                 company {
//                     id
//                     name
//                 }
//             }
//         }
//     `;
//
//     const {data: {jobs}} = await apolloClient.query({
//         query,
//         fetchPolicy: 'network-only',
//     });
//     return jobs;
// }

// export async function createJob({title, description}) {
//     const mutation = gql`
//         mutation createJob($input: CreateJobInput!) {
//             job:createJob(input: $input) {
//                ... JobDetail
//             }
//         }
//         ${jobDetailFragment}
//     `
//
//     const {data: {job}} = await apolloClient.mutate({
//         mutation,
//         variables: {
//             input: {
//                 title,
//                 description
//             }
//         },
//         update: (cache, {data}, options) => {
//             cache.writeQuery({
//                 query: jobByIdQuery,
//                 variables: {id: data.job.id},
//                 data
//             })
//         }
//     })
//     return job
// }