clc;
clear;
close all;



g0 = 9.80665;

% ---------- Structural assumptions ----------
eps_S1 = 0.14;       % Stage 1 structural fraction
eps_S2 = 0.10;       % Stage 2 structural fraction

% ---------- Payload assumptions ----------
payload_mission = 5000 + 26520;   % kg, mission payload carried to LEO
payload_tanker  = 8000;           % kg, tanker kit / docking / transfer system only

% ---------- Delta-V assumptions ----------
dv_total_to_LEO = 10000; 
dv_S1 = 3600; 
dv_S2_ascent = dv_total_to_LEO - dv_S1;  

dv_S2_mission = 9700;

% ---------- Engine / Isp assumptions ----------
Isp_S1 = 352;  
Isp_S2_ascent = 380.80;   


% ---------- Thrust assumptions ----------
T_S1_engine = 2.60e6;             % N per engine
nEng_S1 = 8;
T_S1 = T_S1_engine * nEng_S1;

T_S2_engine = 2.80e6;             % N per engine
nEng_S2 = 3;
T_S2 = T_S2_engine * nEng_S2;

% ---------- Tank / geometry assumptions ----------
H_total_ft = 300;
H_reserved_ft = 60;
tankFillFrac = 0.95;
heightUseFrac = 0.85;

OF = 3.5;                         % O/F mass ratio for methalox
rho_lox = 1141;                   % kg/m^3
rho_ch4 = 422;                    % kg/m^3

% ---------- Tanker / depot assumptions ----------
depot_propellant_target = 500000; % kg, how much propellant depot needs

% ---------- Stage 1 growth study ----------
% 1.00 = baseline Stage 1
% >1 means larger Stage 1 with constant structural fraction eps_S1
S1_scale_array = 1.00:0.05:1.60;


R_S1 = exp(dv_S1/(Isp_S1*g0));
R_S2_ascent = exp(dv_S2_ascent/(Isp_S2_ascent*g0));
R_S2_mission = exp(dv_S2_mission/(Isp_S2_ascent*g0));

fprintf('\nR_S1        = %.4f\n', R_S1);
fprintf('R_S2_ascent = %.4f\n', R_S2_ascent);
fprintf('R_S2_mission= %.4f\n', R_S2_mission);

%%  MISSION UPPER STAGE SIZING FOR ASCENT TO LEO


[ms2_common, mp2_mission_ascent, m0_2_mission_ascent, mb2_mission_ascent] = ...
    stage_from_payload(R_S2_ascent, eps_S2, payload_mission);


% COMMON UPPER-STAGE TANK CAPACITY


mb2_mission_full = ms2_common + payload_mission;
mp2_tank_capacity = (R_S2_mission - 1) * mb2_mission_full;
m0_2_mission_full = mb2_mission_full + mp2_tank_capacity;


% BASELINE STAGE 1 SIZING FOR THE MISSION ASCENT CASE


[ms1_base, mp1_base, m0_1_base, mb1_base] = ...
    stage_from_payload(R_S1, eps_S1, m0_2_mission_ascent);

mdot1_base = T_S1/(g0*Isp_S1);
mdot2_ascent = T_S2/(g0*Isp_S2_ascent);
mdot2_mission = T_S2/(g0*Isp_S2_ascent);

tb_S1_base = mp1_base / mdot1_base;
tb_S2_mission_ascent = mp2_mission_ascent / mdot2_ascent;
tb_S2_mission_full = mp2_tank_capacity / mdot2_mission;

%% ============================================================
% PRINT BASELINE MISSION VEHICLE
%% ============================================================

fprintf('\n==============================================================\n');
fprintf('BASELINE MISSION VEHICLE\n');
fprintf('==============================================================\n');

fprintf('\nStage 2 ascent-to-LEO case\n');
fprintf('Initial mass   = %.1f kg\n', m0_2_mission_ascent);
fprintf('Burnout mass   = %.1f kg\n', mb2_mission_ascent);
fprintf('Dry structure  = %.1f kg\n', ms2_common);
fprintf('Propellant     = %.1f kg\n', mp2_mission_ascent);
fprintf('Burn time      = %.1f s (%.2f min)\n', tb_S2_mission_ascent, tb_S2_mission_ascent/60);

fprintf('\nStage 2 full-tank mission case\n');
fprintf('Initial mass   = %.1f kg\n', m0_2_mission_full);
fprintf('Burnout mass   = %.1f kg\n', mb2_mission_full);
fprintf('Dry structure  = %.1f kg\n', ms2_common);
fprintf('Propellant cap = %.1f kg\n', mp2_tank_capacity);
fprintf('Burn time      = %.1f s (%.2f min)\n', tb_S2_mission_full, tb_S2_mission_full/60);

fprintf('\nStage 1 baseline\n');
fprintf('Initial mass   = %.1f kg\n', m0_1_base);
fprintf('Burnout mass   = %.1f kg\n', mb1_base);
fprintf('Dry structure  = %.1f kg\n', ms1_base);
fprintf('Propellant     = %.1f kg\n', mp1_base);
fprintf('Burn time      = %.1f s (%.2f min)\n', tb_S1_base, tb_S1_base/60);

fprintf('\nMass flow rates\n');
fprintf('mdot1          = %.2f kg/s\n', mdot1_base);
fprintf('mdot2 ascent   = %.2f kg/s\n', mdot2_ascent);
fprintf('mdot2 mission  = %.2f kg/s\n', mdot2_mission);

%% ============================================================
% COMMON TANK SIZING (GEOMETRY)
%% ============================================================

H_total = H_total_ft * 0.3048;
H_reserved = H_reserved_ft * 0.3048;
H_usable = H_total - H_reserved;

mwet1_base = m0_1_base - m0_2_mission_ascent;
mwet_upper_full = m0_2_mission_full - payload_mission;

frac1 = mwet1_base / (mwet1_base + mwet_upper_full);
frac_upper = mwet_upper_full / (mwet1_base + mwet_upper_full);

H_stage1 = frac1 * H_usable;
H_stage2 = frac_upper * H_usable;

H_tank1 = H_stage1 * heightUseFrac;
H_tank2 = H_stage2 * heightUseFrac;

% Stage 1 volumes
[mox1_base, mf1_base, Vox1_base, Vf1_base, Vtot1_base] = ...
    prop_split_and_volume(mp1_base, OF, rho_lox, rho_ch4, tankFillFrac);

% Upper stage full-tank volumes
[mox2_full, mf2_full, Vox2_full, Vf2_full, Vtot2_full] = ...
    prop_split_and_volume(mp2_tank_capacity, OF, rho_lox, rho_ch4, tankFillFrac);

% Upper stage mission ascent fill
[mox2_ascent, mf2_ascent, Vox2_ascent, Vf2_ascent, ~] = ...
    prop_split_and_volume(mp2_mission_ascent, OF, rho_lox, rho_ch4, tankFillFrac);

D1_base = sqrt(4*Vtot1_base/(pi*H_tank1));
D2_common = sqrt(4*Vtot2_full/(pi*H_tank2));
D_common = max(D1_base, D2_common);

A_common = pi/4 * D_common^2;

h_lox1_base = Vox1_base / A_common;
h_ch41_base = Vf1_base / A_common;
h_total1_base = (h_lox1_base + h_ch41_base)/tankFillFrac;

h_lox2_full = Vox2_full / A_common;
h_ch42_full = Vf2_full / A_common;
h_total2_full = (h_lox2_full + h_ch42_full)/tankFillFrac;

h_lox2_ascent = Vox2_ascent / A_common;
h_ch42_ascent = Vf2_ascent / A_common;
h_total2_ascent = (h_lox2_ascent + h_ch42_ascent)/tankFillFrac;

fprintf('\n==============================================================\n');
fprintf('COMMON UPPER STAGE TANK SIZING (METHALOX)\n');
fprintf('==============================================================\n');

fprintf('\nTotal rocket height          = %.1f ft (%.2f m)\n', H_total_ft, H_total);
fprintf('Reserved non-tank height     = %.1f ft (%.2f m)\n', H_reserved_ft, H_reserved);
fprintf('Usable stage height          = %.2f m\n', H_usable);

fprintf('\nEstimated stage heights\n');
fprintf('Stage 1 section height       = %.2f m\n', H_stage1);
fprintf('Upper stage section height   = %.2f m\n', H_stage2);

fprintf('\nAvailable cylindrical tank heights\n');
fprintf('Stage 1 tank height          = %.2f m\n', H_tank1);
fprintf('Upper stage tank height      = %.2f m\n', H_tank2);

fprintf('\nStage 1 baseline tanking\n');
fprintf('Propellant mass              = %.2f kg\n', mp1_base);
fprintf('LOX mass                     = %.2f kg\n', mox1_base);
fprintf('CH4 mass                     = %.2f kg\n', mf1_base);
fprintf('LOX volume                   = %.2f m^3\n', Vox1_base);
fprintf('CH4 volume                   = %.2f m^3\n', Vf1_base);
fprintf('Total tank volume            = %.2f m^3\n', Vtot1_base);
fprintf('Required diameter            = %.2f m (%.2f ft)\n', D1_base, D1_base/0.3048);

fprintf('\nUpper stage common full-tank sizing\n');
fprintf('Propellant capacity          = %.2f kg\n', mp2_tank_capacity);
fprintf('LOX mass                     = %.2f kg\n', mox2_full);
fprintf('CH4 mass                     = %.2f kg\n', mf2_full);
fprintf('LOX volume                   = %.2f m^3\n', Vox2_full);
fprintf('CH4 volume                   = %.2f m^3\n', Vf2_full);
fprintf('Total tank volume            = %.2f m^3\n', Vtot2_full);
fprintf('Required diameter            = %.2f m (%.2f ft)\n', D2_common, D2_common/0.3048);

fprintf('\nCommon vehicle diameter      = %.2f m (%.2f ft)\n', D_common, D_common/0.3048);

fprintf('\nAt common diameter %.2f m\n', D_common);
fprintf('Stage 1 total tank height    = %.2f m\n', h_total1_base);
fprintf('Upper stage full tank height = %.2f m\n', h_total2_full);
fprintf('Upper stage ascent fill ht   = %.2f m\n', h_total2_ascent);

%% ============================================================
% MISSION PROFILE FOR FULL MISSION UPPER STAGE
%% ============================================================

burn_names = {
    'LEO -> TLI'
    'TLI -> NRHO'
    'NRHO -> LLO'
    'LLO -> Lunar Surface'
    'Surface -> LLO'
    'LLO -> NRHO'
    'NRHO -> Earth Return'
};

burn_dv = [3200; 450; 750; 2050; 1860; 750; 450];

m_dry_mission = ms2_common + payload_mission;
m_current = m0_2_mission_full;
fuel_current = mp2_tank_capacity;
Isp_profile = Isp_S2_ascent;

N = length(burn_dv);
mass_hist = zeros(N,1);
fuel_hist = zeros(N,1);
dv_hist = zeros(N,1);

fprintf('\n==============================================================\n');
fprintf('MISSION UPPER STAGE PROFILE\n');
fprintf('==============================================================\n');
fprintf('Initial Mass      : %.0f kg\n', m_current);
fprintf('Initial Fuel      : %.0f kg\n', fuel_current);
fprintf('Initial Delta-V   : %.0f m/s\n\n', dv_S2_mission);

fprintf('%-28s %10s %18s %18s %18s\n', ...
    'Burn Segment', 'dV (m/s)', 'Mass (kg)', 'Fuel (kg)', 'dV Remaining');

for i = 1:N
    dv_i = burn_dv(i);
    m_after = m_current / exp(dv_i/(Isp_profile*g0));
    prop_used = m_current - m_after;

    fuel_current = max(fuel_current - prop_used, 0);
    m_current = m_after;
    dv_remaining = Isp_profile*g0*log(m_current/m_dry_mission);

    mass_hist(i) = m_current;
    fuel_hist(i) = fuel_current;
    dv_hist(i) = dv_remaining;

    fprintf('%-28s %10.0f %18.0f %18.0f %18.0f\n', ...
        burn_names{i}, dv_i, m_current, fuel_current, dv_remaining);
end

fprintf('\nFinal Mass        : %.0f kg\n', m_current);
fprintf('Final Fuel        : %.0f kg\n', fuel_current);
fprintf('Final Delta-V     : %.0f m/s\n', dv_remaining);

%% ============================================================
% TANKER ANALYSIS WITH GROWING STAGE 1
%
% For each Stage 1 scale factor:
%   - Stage 1 is resized with constant structural fraction eps_S1
%   - Upper stage dry structure remains common
%   - Tanker payload is smaller than mission payload
%   - Upper stage prop load is capped by common tank capacity
%   - Delivered fuel to LEO is computed
%% ============================================================

numCases = numel(S1_scale_array);

ms1_arr = zeros(numCases,1);
mp1_arr = zeros(numCases,1);
m0_1_arr = zeros(numCases,1);
tb1_arr = zeros(numCases,1);

upper_wet_max_arr = zeros(numCases,1);
tanker_prop_loaded_arr = zeros(numCases,1);
tanker_fill_frac_arr = zeros(numCases,1);
tanker_fuel_to_LEO_arr = zeros(numCases,1);
tanker_trips_arr = zeros(numCases,1);
tanker_feasible_arr = false(numCases,1);

% Baseline Stage 1 "gross stage mass" excluding payload above it
mStage1_base = ms1_base + mp1_base;

for k = 1:numCases
    s = S1_scale_array(k);

    % Scale Stage 1 gross mass while keeping structural fraction constant
    mStage1_k = s * mStage1_base;
    ms1_k = eps_S1 * mStage1_k;
    mp1_k = (1 - eps_S1) * mStage1_k;

    % Max upper-stage wet mass Stage 1 can hand off at required dv_S1
    Mupper_max_k = mp1_k/(R_S1 - 1) - ms1_k;

    % Max tanker prop load available at stage-2 ignition
    mp2_tanker_loaded_k = Mupper_max_k - ms2_common - payload_tanker;
    mp2_tanker_loaded_k = max(mp2_tanker_loaded_k, 0);
    mp2_tanker_loaded_k = min(mp2_tanker_loaded_k, mp2_tank_capacity);

    % Tanker upper stage initial mass at stage-2 ignition
    m0_2_tanker_k = ms2_common + payload_tanker + mp2_tanker_loaded_k;

    % After stage-2 ascent to LEO
    mf_2_tanker_k = m0_2_tanker_k / R_S2_ascent;

    % Propellant remaining in LEO = delivered transferable fuel
    fuel_to_LEO_k = mf_2_tanker_k - ms2_common - payload_tanker;
    fuel_to_LEO_k = max(fuel_to_LEO_k, 0);

    % Stage 1 liftoff mass and burn time
    m0_1_k = mStage1_k + m0_2_tanker_k;
    tb1_k = mp1_k / mdot1_base;

    % Trips to fill depot
    if fuel_to_LEO_k > 0
        trips_k = ceil(depot_propellant_target / fuel_to_LEO_k);
        feasible_k = true;
    else
        trips_k = inf;
        feasible_k = false;
    end

    % Store
    ms1_arr(k) = ms1_k;
    mp1_arr(k) = mp1_k;
    m0_1_arr(k) = m0_1_k;
    tb1_arr(k) = tb1_k;

    upper_wet_max_arr(k) = Mupper_max_k;
    tanker_prop_loaded_arr(k) = mp2_tanker_loaded_k;
    tanker_fill_frac_arr(k) = mp2_tanker_loaded_k / mp2_tank_capacity;
    tanker_fuel_to_LEO_arr(k) = fuel_to_LEO_k;
    tanker_trips_arr(k) = trips_k;
    tanker_feasible_arr(k) = feasible_k;
end

%% ============================================================
% PRINT TANKER TRADE TABLE
%% ============================================================

fprintf('\n==============================================================\n');
fprintf('TANKER TRADE: SEPARATE TANKER + GROWING STAGE 1\n');
fprintf('==============================================================\n');
fprintf('Tanker payload carried to LEO = %.1f kg\n', payload_tanker);
fprintf('Depot target propellant       = %.1f kg\n', depot_propellant_target);
fprintf('Common upper-stage tank cap   = %.1f kg\n\n', mp2_tank_capacity);

fprintf('%8s %14s %14s %14s %14s %12s\n', ...
    'S1 Scale', 'S1 Prop (kg)', 'Tanker Load', 'Fill Frac', 'Fuel to LEO', 'Trips');

for k = 1:numCases
    if isfinite(tanker_trips_arr(k))
        fprintf('%8.2f %14.0f %14.0f %14.3f %14.0f %12.0f\n', ...
            S1_scale_array(k), mp1_arr(k), tanker_prop_loaded_arr(k), ...
            tanker_fill_frac_arr(k), tanker_fuel_to_LEO_arr(k), tanker_trips_arr(k));
    else
        fprintf('%8.2f %14.0f %14.0f %14.3f %14.0f %12s\n', ...
            S1_scale_array(k), mp1_arr(k), tanker_prop_loaded_arr(k), ...
            tanker_fill_frac_arr(k), tanker_fuel_to_LEO_arr(k), 'INF');
    end
end

%% ============================================================
% IDENTIFY FIRST FEASIBLE TANKER CASE
%% ============================================================

idx_feasible = find(tanker_fuel_to_LEO_arr > 0, 1, 'first');

fprintf('\n==============================================================\n');
fprintf('FIRST FEASIBLE TANKER CASE\n');
fprintf('==============================================================\n');

if isempty(idx_feasible)
    fprintf('No feasible tanker case found in the current S1 scale range.\n');
    fprintf('Increase max S1_scale_array or reduce tanker payload / ascent dv.\n');
else
    fprintf('First feasible S1 scale        = %.2f\n', S1_scale_array(idx_feasible));
    fprintf('Scaled Stage 1 propellant      = %.1f kg\n', mp1_arr(idx_feasible));
    fprintf('Scaled Stage 1 dry structure   = %.1f kg\n', ms1_arr(idx_feasible));
    fprintf('Tanker prop loaded at staging  = %.1f kg\n', tanker_prop_loaded_arr(idx_feasible));
    fprintf('Tanker fill fraction           = %.3f\n', tanker_fill_frac_arr(idx_feasible));
    fprintf('Fuel delivered to LEO / trip   = %.1f kg\n', tanker_fuel_to_LEO_arr(idx_feasible));
    fprintf('Trips to fill depot            = %.0f\n', tanker_trips_arr(idx_feasible));
end

%% ============================================================
% PLOTS
%% ============================================================

figure;
plot(S1_scale_array, tanker_fuel_to_LEO_arr/1000, 'LineWidth', 2);
grid on;
xlabel('Stage 1 capability scale factor');
ylabel('Fuel delivered to LEO per tanker flight [tonnes]');
title('Tanker Fuel Delivered to LEO vs Stage 1 Growth');

figure;
plot(S1_scale_array, tanker_fill_frac_arr*100, 'LineWidth', 2);
grid on;
xlabel('Stage 1 capability scale factor');
ylabel('Stage 2 tanker fill fraction [%]');
title('Tanker Upper Stage Fill Fraction vs Stage 1 Growth');

figure;
plot(S1_scale_array(isfinite(tanker_trips_arr)), ...
     tanker_trips_arr(isfinite(tanker_trips_arr)), 'LineWidth', 2);
grid on;
xlabel('Stage 1 scale factor');
ylabel('Trips to fill Refueler');
title('Number of Trips Required');

%% ============================================================
% OPTIONAL: SINGLE-CASE CHECK AT USER-SELECTED SCALE
%% ============================================================

S1_scale_selected = 1.20;

mStage1_sel = S1_scale_selected * mStage1_base;
ms1_sel = eps_S1 * mStage1_sel;
mp1_sel = (1 - eps_S1) * mStage1_sel;

Mupper_max_sel = mp1_sel/(R_S1 - 1) - ms1_sel;
mp2_tanker_loaded_sel = Mupper_max_sel - ms2_common - payload_tanker;
mp2_tanker_loaded_sel = max(mp2_tanker_loaded_sel, 0);
mp2_tanker_loaded_sel = min(mp2_tanker_loaded_sel, mp2_tank_capacity);

m0_2_tanker_sel = ms2_common + payload_tanker + mp2_tanker_loaded_sel;
mf_2_tanker_sel = m0_2_tanker_sel / R_S2_ascent;
fuel_to_LEO_sel = max(mf_2_tanker_sel - ms2_common - payload_tanker, 0);

fprintf('\n==============================================================\n');
fprintf('SINGLE SELECTED TANKER CASE\n');
fprintf('==============================================================\n');
fprintf('Selected S1 scale             = %.2f\n', S1_scale_selected);
fprintf('Stage 1 dry mass              = %.1f kg\n', ms1_sel);
fprintf('Stage 1 propellant mass       = %.1f kg\n', mp1_sel);
fprintf('Max upper-stage wet mass      = %.1f kg\n', Mupper_max_sel);
fprintf('Tanker prop loaded            = %.1f kg\n', mp2_tanker_loaded_sel);
fprintf('Fuel delivered to LEO         = %.1f kg\n', fuel_to_LEO_sel);

if fuel_to_LEO_sel > 0
    fprintf('Trips to fill depot           = %.0f\n', ceil(depot_propellant_target / fuel_to_LEO_sel));
else
    fprintf('Trips to fill depot           = INF (not feasible)\n');
end

%% ============================================================
% LOCAL FUNCTIONS
%% ============================================================

function [ms, mp, m0, mb] = stage_from_payload(R, eps, payload_above)
    % Returns stage dry structure, propellant, initial mass, burnout mass
    % for a stage with structural fraction eps lifting payload_above.
    m_stage_total = ((1 - R) / (R*eps - 1)) * payload_above;
    ms = eps * m_stage_total;
    mp = (1 - eps) * m_stage_total;
    m0 = m_stage_total + payload_above;
    mb = ms + payload_above;
end

function [mox, mf, Vox, Vf, Vtot] = prop_split_and_volume(mp, OF, rho_lox, rho_ch4, tankFillFrac)
    mox = mp * OF/(1 + OF);
    mf  = mp /(1 + OF);

    Vox = mox / rho_lox;
    Vf  = mf  / rho_ch4;

    Vtot = (Vox + Vf) / tankFillFrac;
end


