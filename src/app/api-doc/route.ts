import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: { 
      title: "Mini Event Management API", 
      version: "1.0.0",
      description: "API documentation for the Event Management System"
    },
    paths: {
      "/api/events": {
        get: {
          summary: "List all upcoming events",
          responses: { 
            "200": { description: "Successful response with an array of events" },
            "500": { description: "Server Error" }
          }
        },
        post: {
          summary: "Create a new event",
          requestBody: {
            required: true,
            content: { 
              "application/json": { 
                schema: { 
                  type: "object", 
                  properties: { 
                    title: { type: "string" }, 
                    description: { type: "string" },
                    date: { type: "string", format: "date-time" }, 
                    totalCapacity: { type: "integer" } 
                  },
                  required: ["title", "date", "totalCapacity"]
                } 
              } 
            }
          },
          responses: { 
            "201": { description: "Event successfully created" },
            "400": { description: "Invalid input data" }
          }
        }
      },
      "/api/bookings": {
        post: {
          summary: "Book a ticket for a user",
          description: "Checks availability and updates remaining tickets in a transaction. Returns a unique booking code.",
          requestBody: {
            required: true,
            content: { 
              "application/json": { 
                schema: { 
                  type: "object", 
                  properties: { 
                    userId: { type: "string" }, 
                    eventId: { type: "string" }, 
                    ticketCount: { type: "integer", default: 1 } 
                  },
                  required: ["userId", "eventId"]
                } 
              } 
            }
          },
          responses: { 
            "201": { description: "Booking successful with unique code returned" },
            "400": { description: "Not enough tickets available or invalid event" }
          }
        }
      },
      "/api/users/{id}/bookings": {
        get: {
          summary: "Retrieve all bookings made by a specific user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
          ],
          responses: {
            "200": { description: "Successful response with user bookings" },
            "500": { description: "Failed to fetch bookings" }
          }
        }
      },
      "/api/events/{id}/attendance": {
        post: {
          summary: "Mark attendance for an event",
          description: "Takes the unique booking code as input and returns how many tickets were booked under that code.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Event ID" }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { uniqueCode: { type: "string" } },
                  required: ["uniqueCode"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Attendance logged successfully, returns tickets booked count" },
            "400": { description: "Code not valid for this specific event" },
            "404": { description: "Invalid booking code" }
          }
        }
      }
    }
  };
  
  return NextResponse.json(swaggerSpec);
}
