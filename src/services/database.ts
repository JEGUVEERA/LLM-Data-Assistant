/**
 * Represents a database query.
 */
export interface Query {
  /**
   * The query string.
   */
  queryString: string;
}

/**
 * Represents the database query result.
 */
export interface QueryResult {
    /**
     * The columns returned
     */
    columns: string[],
    /**
     * The results of the query. Each inner array represents a row.
     */
    rows: string[][];
}

/**
 * Asynchronously retrieves data from a database based on a query.
 * This is a MOCK implementation. Replace with actual database interaction.
 *
 * @param query The query to execute.
 * @returns A promise that resolves to a QueryResult object containing database query results.
 */
export async function executeQuery(query: Query): Promise<QueryResult> {
  console.log("Executing MOCK query:", query.queryString);

  // Simulate different responses based on a simplified query pattern
  const lowerCaseQuery = query.queryString.toLowerCase();

  if (lowerCaseQuery.includes("failed") && lowerCaseQuery.includes("last week")) {
    // Simulate fetching frequently failed tests from the last week
    return {
      columns: ['TestCaseID', 'ModuleName', 'FailureCount', 'LastFailedTimestamp'],
      rows: [
        ['TC001', 'AuthService', '15', '2024-07-25 10:30:00'],
        ['TC105', 'PaymentGateway', '12', '2024-07-24 15:00:00'],
        ['TC003', 'UserProfile', '8', '2024-07-26 08:15:00'],
        ['TC210', 'AuthService', '5', '2024-07-23 11:45:00'],
      ],
    };
  } else if (lowerCaseQuery.includes("performance") && lowerCaseQuery.includes("login")) {
     // Simulate fetching performance data for login tests
     return {
       columns: ['TestRunID', 'TestCaseID', 'ExecutionTime(ms)', 'Timestamp'],
       rows: [
         ['RUN001', 'TC_Login_Valid', '150', '2024-07-26 09:00:00'],
         ['RUN001', 'TC_Login_Invalid', '180', '2024-07-26 09:01:00'],
         ['RUN002', 'TC_Login_Valid', '165', '2024-07-25 09:00:00'],
         ['RUN002', 'TC_Login_Invalid', '190', '2024-07-25 09:01:00'],
         ['RUN003', 'TC_Login_Valid', '145', '2024-07-24 09:00:00'],
         ['RUN003', 'TC_Login_Invalid', '175', '2024-07-24 09:01:00'],
       ],
     };
  } else if (lowerCaseQuery.includes("error") && lowerCaseQuery.includes("api")) {
      // Simulate fetching API errors from logs
      return {
          columns: ['Timestamp', 'LogLevel', 'ServiceName', 'ErrorCode', 'Message'],
          rows: [
              ['2024-07-26 11:05:12', 'ERROR', 'OrderAPI', '500', 'Internal Server Error processing order 123'],
              ['2024-07-26 10:58:45', 'ERROR', 'PaymentAPI', '401', 'Unauthorized access attempt'],
              ['2024-07-25 16:30:01', 'ERROR', 'ProductAPI', '404', 'Product not found: XYZ'],
          ],
      };
  } else {
     // Default mock data if no specific pattern matches
    return {
      columns: ['TestCaseID', 'Status', 'Duration(s)', 'Timestamp'],
      rows: [
        ['TC001', 'Failed', '5.2', '2024-07-26 14:00:00'],
        ['TC002', 'Passed', '3.1', '2024-07-26 14:01:00'],
        ['TC003', 'Passed', '4.5', '2024-07-26 14:02:00'],
        ['TC004', 'Failed', '10.8', '2024-07-26 14:03:00'],
        ['TC005', 'Passed', '2.9', '2024-07-26 14:04:00'],
      ],
    };
  }
}
