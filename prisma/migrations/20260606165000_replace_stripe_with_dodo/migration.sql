ALTER TABLE "Entitlement" RENAME COLUMN "stripeCustomerId" TO "providerCustomerId";
ALTER TABLE "Entitlement" RENAME COLUMN "stripeCheckoutSessionId" TO "providerCheckoutSessionId";
ALTER TABLE "Entitlement" RENAME COLUMN "stripePaymentIntentId" TO "providerPaymentId";

ALTER TABLE "Entitlement" ADD COLUMN "paymentProvider" TEXT NOT NULL DEFAULT 'dodo';

ALTER INDEX "Entitlement_stripeCheckoutSessionId_key" RENAME TO "Entitlement_providerCheckoutSessionId_key";
DROP INDEX "Entitlement_stripeCustomerId_idx";
CREATE INDEX "Entitlement_providerCustomerId_idx" ON "Entitlement"("providerCustomerId");
CREATE UNIQUE INDEX "Entitlement_providerPaymentId_key" ON "Entitlement"("providerPaymentId");

ALTER TABLE "StripeEvent" RENAME TO "PaymentEvent";
ALTER TABLE "PaymentEvent" RENAME CONSTRAINT "StripeEvent_pkey" TO "PaymentEvent_pkey";
ALTER TABLE "PaymentEvent" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'dodo';
CREATE INDEX "PaymentEvent_provider_type_idx" ON "PaymentEvent"("provider", "type");
