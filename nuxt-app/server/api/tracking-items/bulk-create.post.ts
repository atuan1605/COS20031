import { trackingItems } from "../../db/schema";
import { db } from "../../db";

// Function to generate random 12 digit tracking number
function generateTrackingNumber(): string {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Function to generate random weight between 0.1 and 50.0 kg
function generateRandomWeight(): string {
  return (Math.random() * 49.9 + 0.1).toFixed(2);
}

// Function to generate random amount between 1000 and 100000
function generateRandomAmount(): string {
  return Math.floor(Math.random() * 99000 + 1000).toString();
}

// Function to get random status
function getRandomStatus() {
  const statuses = [
    "none",
    "returnedAtWarehouse",
    "customerReturn",
    "continue",
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export default defineEventHandler(async (event) => {
  try {
    console.log(" Starting bulk creation of 10,000 tracking items...");

    const batchSize = 500; // Insert in batches to avoid memory issues
    const totalItems = 10000;
    const batches = Math.ceil(totalItems / batchSize);

    let createdCount = 0;
    const usedTrackingNumbers = new Set<string>();

    // Get existing tracking numbers to avoid duplicates
    const existingItems = await db
      .select({ tracking_number: trackingItems.tracking_number })
      .from(trackingItems);
    existingItems.forEach((item: { tracking_number: string }) =>
      usedTrackingNumbers.add(item.tracking_number)
    );

    console.log(`📋 Found ${existingItems.length} existing tracking numbers`);

    for (let batch = 0; batch < batches; batch++) {
      const itemsInThisBatch = Math.min(
        batchSize,
        totalItems - batch * batchSize
      );
      const batchItems = [];

      console.log(
        `Processing batch ${
          batch + 1
        }/${batches} (${itemsInThisBatch} items)`
      );

      // Generate unique tracking numbers for this batch
      for (let i = 0; i < itemsInThisBatch; i++) {
        let trackingNumber: string;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep generating until we get a unique tracking number
        do {
          trackingNumber = generateTrackingNumber();
          attempts++;

          if (attempts > maxAttempts) {
            throw new Error(
              `Failed to generate unique tracking number after ${maxAttempts} attempts`
            );
          }
        } while (usedTrackingNumbers.has(trackingNumber));

        usedTrackingNumbers.add(trackingNumber);

        batchItems.push({
          tracking_number: trackingNumber,
          weight: generateRandomWeight(),
          amount: generateRandomAmount(),
          is_fragile_item: Math.random() < 0.2, // 20% chance of being fragile
          returned_status: getRandomStatus() as any,
          file: Math.random() < 0.3 ? `file_${trackingNumber}.pdf` : null, // 30% chance of having a file
        });
      }

      // Insert batch
      await db.insert(trackingItems).values(batchItems);
      createdCount += itemsInThisBatch;

      console.log(
        ` Batch ${
          batch + 1
        } completed. Total created: ${createdCount}/${totalItems}`
      );
    }

    console.log(" Bulk creation completed successfully!");

    return {
      success: true,
      message: `Successfully created ${createdCount} tracking items`,
      totalCreated: createdCount,
      summary: {
        totalItems: createdCount,
        batchSize,
        batches,
        uniqueTrackingNumbers: usedTrackingNumbers.size,
      },
    };
  } catch (error: any) {
    console.error(" Error in bulk creation:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Bulk creation failed: ${error.message}`,
    });
  }
});
