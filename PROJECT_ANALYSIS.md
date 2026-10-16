# Green Grid — Project Analysis & Requirements Specification

---

## 1. Executive Summary
**Green Grid** is an enterprise-grade Smart Energy Management and Sustainability Platform. The application bridges the gap between individual energy consumption habits, renewable energy tracking, automated tariff cost calculation, carbon footprint mitigation, and proactive alert notifications.

---

## 2. Problem Statement
1. **Opaque Electricity Consumption**: Households and small businesses lack real-time visibility into which appliances are consuming disproportionate energy.
2. **Disconnected Renewable Generation**: Solar rooftop and wind generation outputs are rarely integrated with load consumption data to show net self-consumption percentages.
3. **Complex Tariff & Cost Predictions**: Consumers are unaware of bill surges until receiving utility statements at cycle-end.
4. **Lack of Actionable Insights**: Raw kWh readings without localized, data-driven recommendations fail to inspire conservation behavior.
5. **Absence of Centralized Administration**: System administrators and energy monitors lack a unified cockpit to supervise collective energy adoption, regional carbon savings, and device-level efficiency.

---

## 3. Proposed Solution
Green Grid delivers a comprehensive end-to-end full-stack platform:
- **Device Inventory Management**: Register electrical devices, quantify rated wattage, and compute estimated daily kWh using:
  $$\text{dailyConsumption} = \frac{\text{ratedPower (W)} \times \text{quantity} \times \text{usageHoursPerDay}}{1000}$$
- **Consumption Logging**: Ingest manual logs, smart-meter telemetry, and estimated profiles with automated cost assignment derived from dynamic tariffs.
- **Renewable Energy Tracking**: Log solar and wind generation, calculate self-reliance percentages, and quantify net energy balance.
- **Dynamic Tariff Engine**: Decouple price modeling from code logic using active `EnergyTariff` records with base charges and per-kWh rates.
- **Automated Threshold Alerts**: Background event checks for daily limit overruns, projected monthly bill escalations, and device overuse.
- **Tailored Eco-Recommendations**: Algorithmic advice generated dynamically based on actual database usage patterns.
- **Micro & Macro Analytics**: Daily, weekly, and monthly trends, carbon abatement estimates, and device consumption hierarchies.
- **Role-Based Admin Supervision**: Platform overview, user enablement controls, system-wide energy metrics, and tariff lifecycle management.

---

## 4. User Personas & Role Matrix

### 4.1. Standard User (`USER`)
- Authenticate securely via JWT.
- Manage profile credentials and energy threshold preferences (`dailyConsumptionLimit`, `monthlyCostLimit`, `carbonFactor`).
- Register, inspect, edit, and delete electrical appliances.
- Submit energy consumption logs and view chronological history.
- Record renewable generation logs (solar PV, wind turbines).
- View analytical charts (daily trends, cost projections, carbon savings).
- Receive notifications on threshold breaches.
- Export customized date-range reports in CSV format.

### 4.2. Platform Administrator (`ADMIN`)
- Supervise platform-wide usage metrics, total user counts, and active adoption rates.
- Search, inspect, and toggle user account statuses (`isActive`).
- Audit system-wide consumption vs. renewable energy generation balance.
- Review platform-wide alert dispatches.
- Create and activate new tariff tiers.

---

## 5. Mathematical & Business Rules
1. **Non-Negativity**: $\text{energyKwh} \ge 0$, $\text{generationKwh} \ge 0$, $\text{ratedPower} > 0$, $\text{quantity} \ge 1$.
2. **Temporal Bounds**: $\text{usageHoursPerDay} \in (0, 24]$.
3. **Dynamic Cost Valuation**:
   $$\text{Cost} = (\text{energyKwh} \times \text{activeTariff.ratePerKwh})$$
4. **Renewable Coverage Ratio**:
   $$\text{Renewable \%} = \min\left(100, \frac{\sum \text{Renewable kWh}}{\sum \text{Consumption kWh}} \times 100\right)$$
5. **Carbon Emissions & Offset**:
   $$\text{Emissions (kg CO}_2\text{)} = \text{Consumption kWh} \times \text{carbonFactor}$$
   $$\text{Carbon Avoided (kg CO}_2\text{)} = \text{Renewable kWh} \times \text{carbonFactor}$$
6. **Data Isolation**: Strict user-level resource ownership guards. A standard user can never query, mutate, or delete records belonging to another user.
