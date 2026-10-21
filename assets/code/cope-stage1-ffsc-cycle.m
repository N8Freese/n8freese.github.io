%% AE 451 STAGE 1 FULL-FLOW STAGED-COMBUSTION CYCLE ANALYSIS
% Propellants: LOX / CH4
% Cycle: Full-flow staged combustion (FFSC)
%
% Updated basis:
% - Main-chamber CEA: 25.53 MPa, O/F = 3.5, Ae/At = 40,
%   infinite-area combustor, equilibrium + frozen.
% - Delivered c* uses eta_c* = 0.98 from the CDR.
% - Delivered vacuum Cf uses the Stage 1 CFD value from the CDR.
% - Pump inlet/outlet pressures use the Stage 1 cycle-balance values
%   already reported in the CDR instead of rebuilding them from assumed
%   line-loss fractions.
% - Pump efficiency = 0.80 and turbine efficiency = 0.85 from the CDR.
% - FR and OR preburner pressures are solved independently to satisfy the
%   project requirement Pturb >= 1.10*Ppump.
% - Existing CEA preburner property tables are retained.
% - A Stage 1 regenerative-cooling model is coupled to the cycle.
% - Heated methane enthalpy is used to correct the FR and OR preburner
%   temperatures before the turbine power balance is solved.
%
% Remaining simplifications:
% - Pump work uses Q*dP/eta with constant liquid density.
% - Preburner CEA is corrected by an enthalpy balance rather than rerun
%   directly at the heated methane inlet state.
% - Turbine expansion uses inlet CEA cp and gamma as constants.
% - Mechanical efficiency is assumed.
% - NPSH required/critical is not yet known.
%
% MATLAB R2016b or newer is required because this script uses local functions.

clear; clc; close all;

inp = define_inputs();
tbl = cea_tables();

eng = engine_sizing(inp);
pm = pump_calc(inp,eng);
regen = regen_stage1(inp,eng);

design = solve_preburner_pressures(inp,tbl,eng,pm,regen);
s = cycle_point(inp,tbl,eng,pm,regen,design.P_PB_FR,design.P_PB_OR);

print_engine_results(inp,eng);
print_regen_results(inp,regen);
print_cycle_results(inp,eng,s,regen);
print_requirement_checks(inp,eng,s,regen);

plot_power_balance(inp,tbl,eng,pm,design,regen);

%% STAGE 1 DELTA-V CHECK
m0_S1 = 1432341;
mf_S1 = 504805;
Isp_S1_dv = 352.28;
dV_S1 = Isp_S1_dv*inp.g0*log(m0_S1/mf_S1);
fprintf('\n============================================================\n');
fprintf('                 STAGE 1 DELTA-V CHECK\n');
fprintf('============================================================\n');
fprintf('Initial mass                     = %.0f kg\n',m0_S1);
fprintf('Final mass                       = %.0f kg\n',mf_S1);
fprintf('Isp used                         = %.2f s\n',Isp_S1_dv);
fprintf('Calculated Delta-V               = %.0f m/s\n',dV_S1);
fprintf('Target Delta-V                   = 3600 m/s\n');
fprintf('Difference                       = %.2f %%\n',100*(dV_S1-3600)/3600);

%% ========================================================================
% LOCAL FUNCTIONS
% ========================================================================

function inp = define_inputs()

inp.g0 = 9.80665;

    %% Vehicle / engine architecture
inp.nEng = 8;
inp.stage1_m0 = 1.460e6;
inp.F_req_engine = 2.750e6;
inp.Isp_SL_req = 329.0;
inp.Isp_vac_req = 358.0;
inp.mdot_target = 772.2;

    %% Main chamber geometry and operating point
inp.Pc = 25.53e6;
inp.OF_main = 3.5;
inp.At = 0.0550;
inp.eps = 40.0;
inp.Pa_SL = 101325;

    %% New main-chamber NASA CEA results
    % Infinite-area combustor, Pc = 255.3 bar, O/F = 3.5, Ae/At = 40
    % Equilibrium solution
inp.Tc_eq = 3733.00;
inp.cstar_eq = 1856.3;
inp.Cf_exit_eq = 1.8582;
inp.Ivac_eq_vel = 3637.3;
inp.Pe_eq = 0.64618e5;
inp.Te_eq = 1875.83;
inp.Me_eq = 3.925;
inp.cp_chamber_eq = 6.0872e3;
inp.gamma_chamber_eq = 1.1356;
inp.MW_chamber_eq = 22.315;

    % Frozen solution, retained as a comparison / lower-performance bound
inp.Tc_frozen = 3733.00;
inp.cstar_frozen = 1822.7;
inp.Cf_exit_frozen = 1.7992;
inp.Ivac_frozen_vel = 3421.8;
inp.Pe_frozen = 0.49849e5;
inp.Te_frozen = 1253.00;
inp.Me_frozen = 4.300;

    %% Delivered-performance corrections
    % CDR adopted characteristic-velocity efficiency
inp.eta_cstar = 0.98;

    % Stage 1 CFD result from the CDR. This replaces the old assumed Cf=1.700.
inp.Cf_vac_CFD = 1.9439;

    %% Propellant inlet properties
inp.T_CH4 = 111.0;
inp.T_LOX = 90.15;

inp.rho_CH4 = 423.5;
inp.rho_LOX = 1142.0;

inp.Pvap_CH4 = 0.095874e6;
inp.Pvap_LOX = 0.10093e6;

    % CDR ullage-pressure requirements; retained for reference.
inp.P_ull_CH4 = 0.300e6;
inp.P_ull_LOX = 0.350e6;

    %% Pump operating point
    % Use the CDR Stage 1 cycle-balance pressures directly instead of the
    % previous assumed "5 percent feed loss" model.
inp.Pin_CH4 = 0.285e6;
inp.Pin_LOX = 0.351e6;
inp.Pd_CH4 = 51.2e6;
inp.Pd_LOX = 45.4e6;

inp.eta_pump_CH4 = 0.80;
inp.eta_pump_LOX = 0.80;

    %% Main injector / turbine discharge pressure
    % CDR cycle balance uses main injector inlet pressure = 1.20*Pc.
inp.main_inj_frac = 0.20;

    %% Preburner operating mixture ratios
    % CDR Stage 1 operating-point values
inp.OF_FR = 0.25;
inp.OF_OR = 50.0;

    %% Turbine model
inp.eta_turb_FR = 0.85;
inp.eta_turb_OR = 0.85;

    % Remaining assumption until bearing / shaft losses are modeled.
inp.eta_mech_FR = 0.98;
inp.eta_mech_OR = 0.98;

inp.T_FR_max = 1000;
inp.T_OR_max = 850;

    % Project requirement from CDR
inp.power_margin_req = 0.10;

    %% Integrated Stage 1 regenerative-cooling model
inp.regen_Tin = 120.0;
inp.regen_contraction_ratio = 2.5;
inp.regen_convergent_angle = 30.0;
inp.regen_L_cylinder = 0.276;
inp.regen_L_injector_throat = 0.516;
inp.regen_L_bell = 2.109;
inp.regen_theta_start = 32.5;
inp.regen_theta_exit = 7.5;
inp.regen_k_wall = 300.0;
inp.regen_wall_limit = 1000.0;
inp.regen_N_channels = 1600;
inp.regen_w_throat = 0.300e-3;
inp.regen_d_chamber = 6.80e-3;
inp.regen_d_inner_nozzle = 5.00e-3;
inp.regen_d_extension = 5.00e-3;
inp.regen_t_wall = 0.280e-3;
inp.regen_split_area_ratio = 10.0;
inp.regen_flow_fraction = [0.35 0.30 0.35];
inp.regen_roughness = 1.0e-6;
inp.regen_K_inlet = 1.0;
inp.regen_K_outlet = 1.0;
inp.regen_downstream_allowance = 2.75e6;
inp.regen_PB_reference = 42.69e6;
inp.regen_gamma_gas = 1.19;
inp.regen_cp_gas = 2330.0;
inp.regen_mu_gas = 1.06e-4;
inp.regen_Pr_gas = 0.63;
inp.regen_gas_heat_multiplier = 1.0;
inp.regen_coolant_heat_multiplier = 1.0;
inp.regen_downstream_radius_ratio = 0.382;
inp.regen_n_segments = 1200;

    %% Valid CEA preburner table pressure range
inp.P_search_min = 40e6;
inp.P_search_max = 53e6;

end


function tbl = cea_tables()

    % Existing preburner CEA sweeps at 40 and 53 MPa.
tbl.P = [40e6 53e6];

    %% Fuel-rich preburner
tbl.OF_FR = [0.15 0.25 0.35 0.45 0.55 0.65 0.75 0.85 0.95 1.05];

tbl.T_FR = [ 613.90 862.91 1022.15 1131.77 1212.09 1274.82 1326.58 1371.56 1418.11 1463.50; 614.47 867.38 1031.62 1145.57 1229.32 1294.77 1348.75 1396.78 1445.48 1492.71];

tbl.cp_FR = 1000*[ 3.2492 4.7769 6.3661 7.9212 9.2079 10.1028 10.6068 10.2737 10.1264 9.7479; 3.2272 4.6573 6.1412 7.6098 8.8365 9.6982 10.1926 9.8592 9.7404 9.4118];

tbl.gam_FR = [ 1.1836 1.1460 1.1370 1.1349 1.1367 1.1409 1.1468 1.1692 1.1793 1.1896; 1.1840 1.1458 1.1364 1.1342 1.1359 1.1403 1.1462 1.1688 1.1790 1.1895];

    %% Oxygen-rich preburner
tbl.OF_OR = 30:2.5:70;

tbl.T_OR = [ 1347.93 1256.96 1176.82 1105.64 1041.97 984.63 932.69 885.41 842.16 802.43 765.78 731.85 700.34 670.98 643.54 617.84 593.71; 1347.93 1256.96 1176.82 1105.64 1041.97 984.63 932.69 885.41 842.16 802.43 765.78 731.85 700.34 670.98 643.54 617.84 593.71];

tbl.cp_OR = 1000*[ 1.2472 1.2259 1.2069 1.1897 1.1736 1.1583 1.1443 1.1312 1.1188 1.1070 1.0956 1.0846 1.0740 1.0638 1.0541 1.0447 1.0357; 1.2472 1.2259 1.2069 1.1897 1.1736 1.1583 1.1443 1.1312 1.1188 1.1070 1.0956 1.0846 1.0740 1.0638 1.0541 1.0447 1.0357];

tbl.gam_OR = [ 1.2739 1.2792 1.2841 1.2888 1.2933 1.2978 1.3021 1.3062 1.3102 1.3142 1.3182 1.3221 1.3260 1.3299 1.3337 1.3375 1.3412; 1.2739 1.2792 1.2841 1.2888 1.2933 1.2978 1.3021 1.3062 1.3102 1.3142 1.3182 1.3221 1.3260 1.3299 1.3337 1.3375 1.3412];

end


function eng = engine_sizing(inp)

    %% CEA-coupled chamber mass flow
eng.cstar_delivered = inp.eta_cstar*inp.cstar_eq;

eng.mdot = inp.Pc*inp.At/eng.cstar_delivered;
eng.mdot_CH4 = eng.mdot/(1 + inp.OF_main);
eng.mdot_LOX = inp.OF_main*eng.mdot_CH4;
eng.stage_mdot = inp.nEng*eng.mdot;

    %% Geometry
eng.Ae = inp.eps*inp.At;
eng.De = 2*sqrt(eng.Ae/pi);

    %% Ideal CEA performance
eng.Cf_vac_CEA = inp.Ivac_eq_vel/inp.cstar_eq;
eng.Isp_vac_CEA_ideal = inp.Ivac_eq_vel/inp.g0;
eng.Isp_vac_frozen_ideal = inp.Ivac_frozen_vel/inp.g0;

    %% Delivered nozzle performance
    % Use existing Stage 1 CFD Cf instead of the former assumed Cf.
eng.Cf_vac = inp.Cf_vac_CFD;
eng.eta_Cf_from_CFD = eng.Cf_vac/eng.Cf_vac_CEA;

    % Vacuum-to-sea-level pressure correction
eng.Cf_SL = eng.Cf_vac - (inp.Pa_SL/inp.Pc)*inp.eps;

eng.F_vac = eng.Cf_vac*inp.Pc*inp.At;
eng.F_SL = eng.Cf_SL*inp.Pc*inp.At;

eng.Isp_vac = eng.F_vac/(eng.mdot*inp.g0);
eng.Isp_SL = eng.F_SL/(eng.mdot*inp.g0);

eng.stage_F_vac = inp.nEng*eng.F_vac;
eng.stage_F_SL = inp.nEng*eng.F_SL;
eng.stage_TW_SL = eng.stage_F_SL/(inp.stage1_m0*inp.g0);

end


function pm = pump_calc(inp,eng)

pm.Pin_CH4 = inp.Pin_CH4;
pm.Pin_LOX = inp.Pin_LOX;

pm.Pd_CH4 = inp.Pd_CH4;
pm.Pd_LOX = inp.Pd_LOX;

pm.dP_CH4 = pm.Pd_CH4 - pm.Pin_CH4;
pm.dP_LOX = pm.Pd_LOX - pm.Pin_LOX;

pm.Q_CH4 = eng.mdot_CH4/inp.rho_CH4;
pm.Q_LOX = eng.mdot_LOX/inp.rho_LOX;

    % Current preliminary liquid-pump model.
pm.Phyd_CH4 = pm.Q_CH4*pm.dP_CH4;
pm.Phyd_LOX = pm.Q_LOX*pm.dP_LOX;

pm.P_CH4 = pm.Phyd_CH4/inp.eta_pump_CH4;
pm.P_LOX = pm.Phyd_LOX/inp.eta_pump_LOX;

pm.H_CH4 = pm.dP_CH4/(inp.rho_CH4*inp.g0);
pm.H_LOX = pm.dP_LOX/(inp.rho_LOX*inp.g0);

pm.NPSHa_CH4 = (pm.Pin_CH4 - inp.Pvap_CH4)/(inp.rho_CH4*inp.g0);
pm.NPSHa_LOX = (pm.Pin_LOX - inp.Pvap_LOX)/(inp.rho_LOX*inp.g0);

end


function r = regen_stage1(inp,eng)

p = methaneTable();
a = struct();
a.name = 'Stage 1';
a.T0 = inp.Tc_eq;
a.md = eng.mdot;
a.mf = eng.mdot_CH4;
a.At = inp.At;
a.Rt = sqrt(a.At/pi);
a.Rc = a.Rt*sqrt(inp.regen_contraction_ratio);
a.Re = a.Rt*sqrt(inp.eps);
a.Lcyl = inp.regen_L_cylinder;
a.Lit = inp.regen_L_injector_throat;
a.Lbell = inp.regen_L_bell;
a.alpha = inp.regen_convergent_angle*pi/180;
a.tn = inp.regen_theta_start*pi/180;
a.te = inp.regen_theta_exit*pi/180;
a.Rd = inp.regen_downstream_radius_ratio*a.Rt;
a.N = inp.regen_N_channels;
a.w = inp.regen_w_throat;
a.tw = inp.regen_t_wall;
a.depth = [inp.regen_d_chamber inp.regen_d_inner_nozzle inp.regen_d_extension];
a.fraction = inp.regen_flow_fraction;
a.split = inp.regen_split_area_ratio;
a.kw = inp.regen_k_wall;
a.Pin = inp.Pd_CH4;
a.Tin = inp.regen_Tin;
a.limit = inp.regen_wall_limit;
a.Prequired = inp.regen_PB_reference + inp.regen_downstream_allowance;
a.rough = inp.regen_roughness;
a.Kin = inp.regen_K_inlet;
a.Kout = inp.regen_K_outlet;
a.gamma = inp.regen_gamma_gas;
a.cp = inp.regen_cp_gas;
a.mu = inp.regen_mu_gas;
a.Pr = inp.regen_Pr_gas;
a.hgFactor = inp.regen_gas_heat_multiplier;
a.hcFactor = inp.regen_coolant_heat_multiplier;
r = solveEngine(a,p,inp.regen_n_segments);
if ~r.valid
error(['Regenerative cooling model failed: ' r.message]);
end
h_CEA_ref = statePT(p,r.Pout,inp.T_CH4).h;
h_regen_out = statePT(p,r.Pout,r.Tmix).h;
r.h_CEA_ref = h_CEA_ref;
r.hout = h_regen_out;
r.dh_from_CEA = h_regen_out-h_CEA_ref;

end


function design = solve_preburner_pressures(inp,tbl,eng,pm,regen)

[~,~,~,~,m_FR,m_OR,valid] = split_flows(eng,inp.OF_FR,inp.OF_OR);

if ~valid
error('Specified FR/OR mixture ratios produce a nonphysical FFSC flow split.');
end

P_turb_out = turbine_exit_pressure(inp);

fFR = @(P) FR_pressure_residual(P,inp,tbl,m_FR,pm.P_CH4,P_turb_out,regen);
fOR = @(P) OR_pressure_residual(P,inp,tbl,m_OR,pm.P_LOX,P_turb_out,regen);

y1 = fFR(inp.P_search_min);
y2 = fFR(inp.P_search_max);

if ~isfinite(y1) || ~isfinite(y2) || y1*y2 > 0
error('Fuel-rich preburner pressure root is not bracketed inside the CEA range.');
end

y1 = fOR(inp.P_search_min);
y2 = fOR(inp.P_search_max);

if ~isfinite(y1) || ~isfinite(y2) || y1*y2 > 0
error('Oxygen-rich preburner pressure root is not bracketed inside the CEA range.');
end

design.P_PB_FR = fzero(fFR,[inp.P_search_min inp.P_search_max]);
design.P_PB_OR = fzero(fOR,[inp.P_search_min inp.P_search_max]);

end


function y = FR_pressure_residual(Ppb,inp,tbl,m_FR,Ppump,P_turb_out,regen)

[T,cp,gam] = gas_FR(tbl,Ppb,inp.OF_FR,regen);

[Pshaft,~,~] = turbine_power( m_FR,T,cp,gam,Ppb,P_turb_out, inp.eta_turb_FR,inp.eta_mech_FR);

y = Pshaft - (1 + inp.power_margin_req)*Ppump;

end


function y = OR_pressure_residual(Ppb,inp,tbl,m_OR,Ppump,P_turb_out,regen)

[T,cp,gam] = gas_OR(tbl,Ppb,inp.OF_OR,regen);

[Pshaft,~,~] = turbine_power( m_OR,T,cp,gam,Ppb,P_turb_out, inp.eta_turb_OR,inp.eta_mech_OR);

y = Pshaft - (1 + inp.power_margin_req)*Ppump;

end


function s = cycle_point(inp,tbl,eng,pm,regen,Ppb_FR,Ppb_OR)

s = struct();

s.P_PB_FR = Ppb_FR;
s.P_PB_OR = Ppb_OR;

s.OF_FR = inp.OF_FR;
s.OF_OR = inp.OF_OR;

[s.mCH4_FR,s.mLOX_FR,s.mCH4_OR,s.mLOX_OR, s.m_FR,s.m_OR,valid] = split_flows(eng,s.OF_FR,s.OF_OR);

if ~valid
error('Nonphysical FFSC flow split.');
end

[s.T_FR,s.cp_FR,s.gam_FR,s.T_FR_CEA,s.dT_FR_regen] = gas_FR(tbl,Ppb_FR,s.OF_FR,regen);
[s.T_OR,s.cp_OR,s.gam_OR,s.T_OR_CEA,s.dT_OR_regen] = gas_OR(tbl,Ppb_OR,s.OF_OR,regen);

s.P_turb_out = turbine_exit_pressure(inp);

[s.P_turb_FR,s.Tout_FR,s.PR_FR] = turbine_power( s.m_FR,s.T_FR,s.cp_FR,s.gam_FR, Ppb_FR,s.P_turb_out,inp.eta_turb_FR,inp.eta_mech_FR);

[s.P_turb_OR,s.Tout_OR,s.PR_OR] = turbine_power( s.m_OR,s.T_OR,s.cp_OR,s.gam_OR, Ppb_OR,s.P_turb_out,inp.eta_turb_OR,inp.eta_mech_OR);

s.margin_FR = s.P_turb_FR/pm.P_CH4 - 1;
s.margin_OR = s.P_turb_OR/pm.P_LOX - 1;

s.pump = pm;

    % Pressure-budget diagnostics using the calculated regen pressure loss.
s.dP_CH4_remaining_to_FR = pm.Pd_CH4 - regen.dP - Ppb_FR;
s.dP_CH4_remaining_to_OR = pm.Pd_CH4 - regen.dP - Ppb_OR;

    % Oxidizer-side residual available for line + injector losses:
s.dP_LOX_remaining_to_FR = pm.Pd_LOX - Ppb_FR;
s.dP_LOX_remaining_to_OR = pm.Pd_LOX - Ppb_OR;

end


function Pout = turbine_exit_pressure(inp)

    % The CDR cycle balance places turbine discharge at the gas-gas main
    % injector inlet, which is 20 percent above chamber pressure.
Pout = inp.Pc*(1 + inp.main_inj_frac);

end


function [mCH4_FR,mLOX_FR,mCH4_OR,mLOX_OR,m_FR,m_OR,valid] = split_flows(eng,OF_FR,OF_OR)

valid = false;

mCH4_FR = NaN;
mLOX_FR = NaN;
mCH4_OR = NaN;
mLOX_OR = NaN;
m_FR = NaN;
m_OR = NaN;

if abs(OF_FR - OF_OR) < 1e-12
return
end

mCH4_FR = (eng.mdot_LOX - OF_OR*eng.mdot_CH4)/(OF_FR - OF_OR);
mCH4_OR = eng.mdot_CH4 - mCH4_FR;

mLOX_FR = OF_FR*mCH4_FR;
mLOX_OR = OF_OR*mCH4_OR;

m_FR = mCH4_FR + mLOX_FR;
m_OR = mCH4_OR + mLOX_OR;

tol = 1e-7;

valid = mCH4_FR > 0 && mCH4_OR > 0 && mLOX_FR > 0 && mLOX_OR > 0;

valid = valid && abs((mCH4_FR + mCH4_OR) - eng.mdot_CH4) < tol*max(1,eng.mdot_CH4);

valid = valid && abs((mLOX_FR + mLOX_OR) - eng.mdot_LOX) < tol*max(1,eng.mdot_LOX);

end


function [T,cp,gam,T_CEA,dT_regen] = gas_FR(tbl,P,OF,regen)

T_CEA = pressure_mixture_interp(tbl.P,tbl.OF_FR,tbl.T_FR,P,OF);
cp = pressure_mixture_interp(tbl.P,tbl.OF_FR,tbl.cp_FR,P,OF);
gam = pressure_mixture_interp(tbl.P,tbl.OF_FR,tbl.gam_FR,P,OF);
xCH4 = 1/(1 + OF);
dT_regen = xCH4*regen.dh_from_CEA/cp;
T = T_CEA + dT_regen;

end


function [T,cp,gam,T_CEA,dT_regen] = gas_OR(tbl,P,OF,regen)

T_CEA = pressure_mixture_interp(tbl.P,tbl.OF_OR,tbl.T_OR,P,OF);
cp = pressure_mixture_interp(tbl.P,tbl.OF_OR,tbl.cp_OR,P,OF);
gam = pressure_mixture_interp(tbl.P,tbl.OF_OR,tbl.gam_OR,P,OF);
xCH4 = 1/(1 + OF);
dT_regen = xCH4*regen.dh_from_CEA/cp;
T = T_CEA + dT_regen;

end


function value = pressure_mixture_interp(Pgrid,OFgrid,data,P,OF)

    % Pressure interpolation is linear between available CEA pressure slices.
    % Mixture-ratio interpolation uses pchip.
v = zeros(size(Pgrid));

for i = 1:numel(Pgrid)
v(i) = interp1(OFgrid,data(i,:),OF,'pchip');
end

value = interp1(Pgrid,v,P,'linear');

end


function [Pshaft,Tout,PR] = turbine_power(mdot,Tin,cp,gam,Pin,Pout,eta_turb,eta_mech)

    % Preliminary turbine model using inlet cp and gamma held constant.
if Pin <= Pout || mdot <= 0 || Tin <= 0 || cp <= 0 || gam <= 1
Pshaft = NaN;
Tout = NaN;
PR = NaN;
return
end

PR = Pin/Pout;

exponent = (gam - 1)/gam;
Tout_s = Tin*(Pout/Pin)^exponent;

delta_h_is = cp*(Tin - Tout_s);
delta_h_actual = eta_turb*delta_h_is;

    % Shaft power delivered after mechanical loss.
Pshaft = mdot*delta_h_actual*eta_mech;

Tout = Tin - delta_h_actual/cp;

end


function print_engine_results(inp,eng)

fprintf('\n============================================================\n');
fprintf('              STAGE 1 ENGINE / MAIN CHAMBER\n');
fprintf('============================================================\n');

fprintf('Main chamber pressure             = %.2f MPa\n',inp.Pc/1e6);
fprintf('Main chamber O/F                  = %.3f\n',inp.OF_main);
fprintf('Throat area                       = %.4f m^2\n',inp.At);
fprintf('Expansion ratio                   = %.1f\n',inp.eps);
fprintf('Exit area                         = %.4f m^2\n',eng.Ae);
fprintf('Exit diameter                     = %.4f m\n',eng.De);

fprintf('\n--- New CEA equilibrium data ---\n');
fprintf('Chamber temperature               = %.1f K\n',inp.Tc_eq);
fprintf('Ideal c*                          = %.1f m/s\n',inp.cstar_eq);
fprintf('Ideal vacuum Cf                   = %.4f\n',eng.Cf_vac_CEA);
fprintf('Ideal vacuum Isp                  = %.1f s\n',eng.Isp_vac_CEA_ideal);
fprintf('CEA exit pressure                 = %.3f kPa\n',inp.Pe_eq/1e3);
fprintf('CEA exit temperature              = %.1f K\n',inp.Te_eq);
fprintf('CEA exit Mach                     = %.3f\n',inp.Me_eq);

fprintf('\n--- Frozen comparison ---\n');
fprintf('Frozen ideal c*                   = %.1f m/s\n',inp.cstar_frozen);
fprintf('Frozen ideal vacuum Isp           = %.1f s\n',eng.Isp_vac_frozen_ideal);
fprintf('Frozen exit pressure              = %.3f kPa\n',inp.Pe_frozen/1e3);
fprintf('Frozen exit Mach                  = %.3f\n',inp.Me_frozen);

fprintf('\n--- Delivered performance model ---\n');
fprintf('c* efficiency                     = %.3f\n',inp.eta_cstar);
fprintf('Delivered c*                      = %.1f m/s\n',eng.cstar_delivered);
fprintf('CFD vacuum Cf                     = %.4f\n',eng.Cf_vac);
fprintf('CFD/CEA vacuum-Cf ratio           = %.4f\n',eng.eta_Cf_from_CFD);
fprintf('Delivered sea-level Cf            = %.4f\n',eng.Cf_SL);

fprintf('Total engine mass flow            = %.2f kg/s\n',eng.mdot);
fprintf('CH4 mass flow                     = %.2f kg/s\n',eng.mdot_CH4);
fprintf('LOX mass flow                     = %.2f kg/s\n',eng.mdot_LOX);

fprintf('Vacuum thrust                     = %.3f MN\n',eng.F_vac/1e6);
fprintf('Sea-level thrust                  = %.3f MN\n',eng.F_SL/1e6);
fprintf('Delivered vacuum Isp              = %.1f s\n',eng.Isp_vac);
fprintf('Delivered sea-level Isp           = %.1f s\n',eng.Isp_SL);

fprintf('Stage mass flow (%d engines)       = %.2f kg/s\n',inp.nEng,eng.stage_mdot);
fprintf('Stage sea-level thrust            = %.3f MN\n',eng.stage_F_SL/1e6);
fprintf('Stage vacuum thrust               = %.3f MN\n',eng.stage_F_vac/1e6);
fprintf('Stage liftoff T/W                 = %.3f\n',eng.stage_TW_SL);

end


function print_regen_results(inp,regen)

fprintf('\n============================================================\n');
fprintf('          STAGE 1 REGENERATIVE COOLING COUPLING\n');
fprintf('============================================================\n');
fprintf('CH4 cooling inlet temperature     = %.2f K\n',inp.regen_Tin);
fprintf('CH4 mixed outlet temperature      = %.2f K\n',regen.Tmix);
fprintf('CH4 cooling inlet pressure        = %.3f MPa\n',inp.Pd_CH4/1e6);
fprintf('CH4 cooling outlet pressure       = %.3f MPa\n',regen.Pout/1e6);
fprintf('Calculated cooling pressure loss  = %.3f MPa\n',regen.dP/1e6);
fprintf('Total regenerative heat pickup    = %.3f MW\n',regen.Q/1e6);
fprintf('Peak gas-side wall temperature    = %.2f K\n',regen.Twg);
fprintf('Wall temperature margin           = %.2f K\n',inp.regen_wall_limit-regen.Twg);
fprintf('Mixed CH4 enthalpy rise vs 111 K  = %.2f kJ/kg\n',regen.dh_from_CEA/1e3);

end


function print_cycle_results(inp,eng,s,regen)

pm = s.pump;

fprintf('\n============================================================\n');
fprintf('                 FEED SYSTEM / PUMPS\n');
fprintf('============================================================\n');

fprintf('CH4 pump inlet pressure           = %.3f MPa\n',pm.Pin_CH4/1e6);
fprintf('LOX pump inlet pressure           = %.3f MPa\n',pm.Pin_LOX/1e6);
fprintf('CH4 pump discharge pressure       = %.2f MPa\n',pm.Pd_CH4/1e6);
fprintf('LOX pump discharge pressure       = %.2f MPa\n',pm.Pd_LOX/1e6);

fprintf('CH4 pump pressure rise            = %.2f MPa\n',pm.dP_CH4/1e6);
fprintf('LOX pump pressure rise            = %.2f MPa\n',pm.dP_LOX/1e6);

fprintf('CH4 pump efficiency               = %.3f\n',inp.eta_pump_CH4);
fprintf('LOX pump efficiency               = %.3f\n',inp.eta_pump_LOX);

fprintf('CH4 pump shaft power              = %.2f MW\n',pm.P_CH4/1e6);
fprintf('LOX pump shaft power              = %.2f MW\n',pm.P_LOX/1e6);

fprintf('CH4 available NPSH                = %.2f m\n',pm.NPSHa_CH4);
fprintf('LOX available NPSH                = %.2f m\n',pm.NPSHa_LOX);

fprintf('\n============================================================\n');
fprintf('               PREBURNERS / TURBINES\n');
fprintf('============================================================\n');

fprintf('Fuel-rich preburner O/F           = %.3f\n',s.OF_FR);
fprintf('Oxygen-rich preburner O/F         = %.3f\n',s.OF_OR);

fprintf('FR preburner pressure             = %.2f MPa\n',s.P_PB_FR/1e6);
fprintf('OR preburner pressure             = %.2f MPa\n',s.P_PB_OR/1e6);

fprintf('FR CEA temperature before regen   = %.1f K\n',s.T_FR_CEA);
fprintf('FR regen temperature correction   = %.1f K\n',s.dT_FR_regen);
fprintf('FR turbine inlet temperature      = %.1f K\n',s.T_FR);
fprintf('OR CEA temperature before regen   = %.1f K\n',s.T_OR_CEA);
fprintf('OR regen temperature correction   = %.1f K\n',s.dT_OR_regen);
fprintf('OR turbine inlet temperature      = %.1f K\n',s.T_OR);

fprintf('FR turbine outlet temperature     = %.1f K\n',s.Tout_FR);
fprintf('OR turbine outlet temperature     = %.1f K\n',s.Tout_OR);

fprintf('Main injector / turbine outlet P  = %.2f MPa\n',s.P_turb_out/1e6);

fprintf('FR turbine pressure ratio         = %.3f\n',s.PR_FR);
fprintf('OR turbine pressure ratio         = %.3f\n',s.PR_OR);

fprintf('FR turbine shaft power            = %.2f MW\n',s.P_turb_FR/1e6);
fprintf('OR turbine shaft power            = %.2f MW\n',s.P_turb_OR/1e6);

fprintf('Fuel-side turbine power margin    = %.2f %%\n',100*s.margin_FR);
fprintf('Ox-side turbine power margin      = %.2f %%\n',100*s.margin_OR);

fprintf('\n--- FFSC flow split ---\n');
fprintf('FR CH4 / LOX / total              = %.2f / %.2f / %.2f kg/s\n', s.mCH4_FR,s.mLOX_FR,s.m_FR);
fprintf('OR CH4 / LOX / total              = %.2f / %.2f / %.2f kg/s\n', s.mCH4_OR,s.mLOX_OR,s.m_OR);

fprintf('\n--- Pressure-budget diagnostics ---\n');
fprintf('Calculated CH4 regen pressure loss = %.2f MPa\n',regen.dP/1e6);
fprintf('CH4 residual to FR PB              = %.2f MPa\n', s.dP_CH4_remaining_to_FR/1e6);
fprintf('CH4 residual to OR PB              = %.2f MPa\n', s.dP_CH4_remaining_to_OR/1e6);
fprintf('LOX residual to FR PB              = %.2f MPa\n', s.dP_LOX_remaining_to_FR/1e6);
fprintf('LOX residual to OR PB              = %.2f MPa\n', s.dP_LOX_remaining_to_OR/1e6);

fprintf('\n============================================================\n');
fprintf('                STAGE 1 CYCLE BALANCE TABLE\n');
fprintf('============================================================\n');

fprintf('%-33s | %13s | %13s\n','Parameter','Fuel Side','Ox Side');
fprintf('%s\n',repmat('-',1,65));
fprintf('%-33s | %13.1f | %13.1f\n','Pump mass flow [kg/s]',eng.mdot_CH4,eng.mdot_LOX);
fprintf('%-33s | %13.3f | %13.3f\n','Pump inlet P [MPa]',pm.Pin_CH4/1e6,pm.Pin_LOX/1e6);
fprintf('%-33s | %13.2f | %13.2f\n','Pump outlet P [MPa]',pm.Pd_CH4/1e6,pm.Pd_LOX/1e6);
fprintf('%-33s | %13.2f | %13.2f\n','Pump shaft power [MW]',pm.P_CH4/1e6,pm.P_LOX/1e6);
fprintf('%-33s | %13.3f | %13.3f\n','Preburner O/F',s.OF_FR,s.OF_OR);
fprintf('%-33s | %13.1f | %13.1f\n','Preburner T [K]',s.T_FR,s.T_OR);
fprintf('%-33s | %13.2f | %13.2f\n','Preburner P [MPa]',s.P_PB_FR/1e6,s.P_PB_OR/1e6);
fprintf('%-33s | %13.1f | %13.1f\n','Turbine mass flow [kg/s]',s.m_FR,s.m_OR);
fprintf('%-33s | %13.3f | %13.3f\n','Turbine pressure ratio',s.PR_FR,s.PR_OR);
fprintf('%-33s | %13.2f | %13.2f\n','Turbine shaft power [MW]',s.P_turb_FR/1e6,s.P_turb_OR/1e6);
fprintf('%-33s | %13.2f | %13.2f\n','Turbine power margin [%]',100*s.margin_FR,100*s.margin_OR);
fprintf('%-33s | %13.2f | %13.2f\n','Turbine outlet P [MPa]', s.P_turb_out/1e6,s.P_turb_out/1e6);

end


function print_requirement_checks(inp,eng,s,regen)

pm = s.pump;

tol_mass = 1e-6;

ch4_error = abs((s.mCH4_FR + s.mCH4_OR) - eng.mdot_CH4);
lox_error = abs((s.mLOX_FR + s.mLOX_OR) - eng.mdot_LOX);
total_error = abs((s.m_FR + s.m_OR) - eng.mdot);

pressure_ok = pm.Pd_CH4 > s.P_PB_FR && pm.Pd_LOX > s.P_PB_OR && s.P_PB_FR > s.P_turb_out && s.P_PB_OR > s.P_turb_out && s.P_turb_out > inp.Pc;

fprintf('\n============================================================\n');
fprintf('                    REQUIREMENT CHECKS\n');
fprintf('============================================================\n');
fprintf('%-36s %-18s %-20s %-8s\n', 'Requirement','Analysis value','Criterion','Status');
fprintf('%s\n',repmat('-',1,86));

fprintf('%-36s %-18s %-20s %-8s\n', 'Sea-level Isp',sprintf('%.1f s',eng.Isp_SL), sprintf('>= %.1f s',inp.Isp_SL_req), passfail(eng.Isp_SL >= inp.Isp_SL_req));

fprintf('%-36s %-18s %-20s %-8s\n', 'Vacuum Isp',sprintf('%.1f s',eng.Isp_vac), sprintf('>= %.1f s',inp.Isp_vac_req), passfail(eng.Isp_vac >= inp.Isp_vac_req));

fprintf('%-36s %-18s %-20s %-8s\n', 'Reference engine mdot',sprintf('%.1f kg/s',eng.mdot), sprintf('~ %.1f kg/s',inp.mdot_target), passfail(abs(eng.mdot-inp.mdot_target)/inp.mdot_target <= 0.01));

fprintf('%-36s %-18s %-20s %-8s\n', 'FFSC mass conservation',sprintf('%.2e kg/s',total_error), 'approximately 0', passfail(ch4_error <= tol_mass && lox_error <= tol_mass && total_error <= tol_mass));

fprintf('%-36s %-18s %-20s %-8s\n', 'Pressure hierarchy','pump>PB>turb>Pc', 'required',passfail(pressure_ok));

fprintf('%-36s %-18s %-20s %-8s\n', 'CH4 turbine/pump power',sprintf('%.3f',s.P_turb_FR/pm.P_CH4), '>= 1.10',passfail(s.P_turb_FR/pm.P_CH4 >= 1.10-1e-6));

fprintf('%-36s %-18s %-20s %-8s\n', 'LOX turbine/pump power',sprintf('%.3f',s.P_turb_OR/pm.P_LOX), '>= 1.10',passfail(s.P_turb_OR/pm.P_LOX >= 1.10-1e-6));

fprintf('%-36s %-18s %-20s %-8s\n', 'FR turbine inlet temperature',sprintf('%.1f K',s.T_FR), sprintf('<= %.0f K',inp.T_FR_max), passfail(s.T_FR <= inp.T_FR_max));

fprintf('%-36s %-18s %-20s %-8s\n', 'OR turbine inlet temperature',sprintf('%.1f K',s.T_OR), sprintf('<= %.0f K',inp.T_OR_max), passfail(s.T_OR <= inp.T_OR_max));

fprintf('%-36s %-18s %-20s %-8s\n', 'Main-chamber CEA coupling','active', 'required','PASS');

fprintf('%-36s %-18s %-20s %-8s\n', 'Delivered nozzle Cf','CFD based', 'preferred','PASS');

fprintf('%-36s %-18s %-20s %-8s\n', 'CH4 available NPSH',sprintf('%.2f m',pm.NPSHa_CH4), 'needs NPSHc','REVIEW');

fprintf('%-36s %-18s %-20s %-8s\n', 'LOX available NPSH',sprintf('%.2f m',pm.NPSHa_LOX), 'needs NPSHc','REVIEW');

fprintf('%-36s %-18s %-20s %-8s\n','Regen thermal pickup','active','required','PASS');
fprintf('%-36s %-18s %-20s %-8s\n','Regen wall temperature',sprintf('%.1f K',regen.Twg),sprintf('<= %.0f K',inp.regen_wall_limit),passfail(regen.Twg <= inp.regen_wall_limit));
fprintf('%-36s %-18s %-20s %-8s\n','Regen pressure to FR PB',sprintf('%.2f MPa',(regen.Pout-s.P_PB_FR)/1e6),sprintf('>= %.2f MPa',inp.regen_downstream_allowance/1e6),passfail(regen.Pout-s.P_PB_FR >= inp.regen_downstream_allowance));
fprintf('%-36s %-18s %-20s %-8s\n','Heated-CH4 preburner model','enthalpy corrected','rerun CEA preferred','REVIEW');

fprintf('%-36s %-18s %-20s %-8s\n', 'Turbine enthalpy model','cp/gamma approx.', 'future update','REVIEW');

end


function out = passfail(condition)

if condition
out = 'PASS';
else
out = 'REVIEW';
end

end


function plot_power_balance(inp,tbl,eng,pm,design,regen)

[~,~,~,~,m_FR,m_OR,valid] = split_flows(eng,inp.OF_FR,inp.OF_OR);

if ~valid
return
end

Pvec = linspace(inp.P_search_min,inp.P_search_max,150);
margin_FR = nan(size(Pvec));
margin_OR = nan(size(Pvec));

Pout = turbine_exit_pressure(inp);

for k = 1:numel(Pvec)

[TFR,cpFR,gFR] = gas_FR(tbl,Pvec(k),inp.OF_FR,regen);
[TOR,cpOR,gOR] = gas_OR(tbl,Pvec(k),inp.OF_OR,regen);

PFR = turbine_power(m_FR,TFR,cpFR,gFR,Pvec(k),Pout, inp.eta_turb_FR,inp.eta_mech_FR);

POR = turbine_power(m_OR,TOR,cpOR,gOR,Pvec(k),Pout, inp.eta_turb_OR,inp.eta_mech_OR);

margin_FR(k) = PFR/pm.P_CH4 - 1;
margin_OR(k) = POR/pm.P_LOX - 1;

end

figure('Name','FFSC Preburner Power Balance');
plot(Pvec/1e6,100*margin_FR,'LineWidth',1.5);
hold on;
plot(Pvec/1e6,100*margin_OR,'LineWidth',1.5);
yline(100*inp.power_margin_req,'--','10% requirement');
xline(design.P_PB_FR/1e6,'--');
xline(design.P_PB_OR/1e6,'--');
grid on;

xlabel('Preburner Pressure [MPa]');
ylabel('Turbine Power Margin [%]');
title('Stage 1 FFSC Turbine Power Margin');
legend('Fuel-rich side','Oxygen-rich side','Location','best');

end


%% ========================================================================
% REGENERATIVE-COOLING HELPER FUNCTIONS
% ========================================================================

function r = solveEngine(a,p,n)

r = struct('valid',false,'message','');

try

assert(all(a.fraction > 0) && abs(sum(a.fraction)-1) < 1e-10, 'Invalid flow split.');

assert(a.w < 2*pi*(a.Rt+a.tw)/a.N, 'Channels overlap.');

[x,y,s,Rf] = engineContour(a,n);

rb = a.Rt*sqrt(a.split);

mask = x >= 0;

xb = interp1(y(mask),x(mask),rb);

sb = interp1(x,s,xb);

s0 = interp1(x,s,0);

c = x < 0;

nn = x > 0 & x < xb;

e = x > xb;

        % Branch 1: throat toward chamber.

        % Branch 2: throat toward inner-nozzle outlet.

        % Branch 3: nozzle exit toward extension outlet.

X = { flipud([x(c);0]); [0;x(nn);xb]; flipud([xb;x(e)]) };

Y = { flipud([y(c);a.Rt]); [a.Rt;y(nn);rb]; flipud([rb;y(e)]) };

S = { flipud([s(c);s0]); [s0;s(nn);sb]; flipud([sb;s(e)]) };

r.names = {'Chamber','Inner nozzle','Extension'};

r.branches = cell(1,3);

data = [];

hout = 0;

heat = 0;

energy = 0;

pressures = zeros(1,3);

for j = 1:3

b = coolingBranch( a,p,X{j},Y{j},S{j},Rf, a.mf*a.fraction(j),a.depth(j));

r.branches{j} = b;

data = [data;b.data];

pressures(j) = b.Pout;

hout = hout+a.fraction(j)*b.hout;

heat = heat+b.Q;

energy = energy+b.mdot*(b.hout-b.hin);

end

        % Ideal balancing restrictions are isenthalpic.

r.Pout = min(pressures);

r.balance = pressures-r.Pout;

mix = statePH(p,r.Pout,hout);

r.Tmix = mix.T;

r.Q = heat;

r.dP = a.Pin-r.Pout;

r.energyResidual = (energy-heat)/max(heat,1);

[r.Twg,j] = max(data(:,7));

r.peak = data(j,:);

r.Twc = max(data(:,8));

r.qmax = max(data(:,9));

        % Chamber-side throat velocity.

d = r.branches{1}.data;

[~,j] = min(abs(d(:,1)));

r.vthroat = d(j,10);

r.thermalPass = r.Twg <= a.limit;

r.pressurePass = r.Pout >= a.Prequired;

r.valid = true;

catch ME

r.message = ME.message;

end

end

function [x,y,s,Rf] = engineContour(a,n)

L = a.Lit-a.Lcyl;

dr = a.Rc-a.Rt;

al = a.alpha;

    % Equal convergent fillets fitted to the fixed CDR geometry.

Rf = (L*sin(al)-dr*cos(al))/(2*(1-cos(al)));

x1 = -L+Rf*sin(al);

y1 = a.Rc-Rf*(1-cos(al));

x2 = -Rf*sin(al);

y2 = a.Rt+Rf*(1-cos(al));

assert(Rf > 0 && x2 >= x1 && y1 >= y2, 'Invalid convergent geometry.');

t = linspace(0,al,100)';

x = [ linspace(-a.Lit,-L,100)'; -L+Rf*sin(t); linspace(x1,x2,100)'; -Rf*sin(flipud(t)) ];

y = [ a.Rc*ones(100,1); a.Rc-Rf*(1-cos(t)); linspace(y1,y2,100)'; a.Rt+Rf*(1-cos(flipud(t))) ];

    % Downstream throat arc and quadratic Bezier bell.

xn = a.Rd*sin(a.tn);

yn = a.Rt+a.Rd*(1-cos(a.tn));

xq = (a.Re-yn+tan(a.tn)*xn-tan(a.te)*a.Lbell) / (tan(a.tn)-tan(a.te));

yq = yn+tan(a.tn)*(xq-xn);

assert(xq > xn && xq < a.Lbell, 'Invalid bell tangent intersection.');

t = linspace(0,a.tn,100)';

u = linspace(0,1,400)';

x = [ x; a.Rd*sin(t); (1-u).^2*xn+2*(1-u).*u*xq+u.^2*a.Lbell ];

y = [ y; a.Rt+a.Rd*(1-cos(t)); (1-u).^2*yn+2*(1-u).*u*yq+u.^2*a.Re ];

keep = [true;diff(x) > 1e-12];

x = x(keep);

y = y(keep);

s = [0;cumsum(hypot(diff(x),diff(y)))];

    % Include throat and cylinder/convergent junction as mesh nodes.

sn = unique(sort([ linspace(0,s(end),n+1)'; interp1(x,s,0); interp1(x,s,-L) ]));

y = interp1(s,y,sn);

x = interp1(s,x,sn);

s = sn;

end

function b = coolingBranch(a,p,x,y,s,Rf,md,depth)

inlet = statePT(p,a.Pin,a.Tin);

h = inlet.h;

    % Total coolant flow area at a given gas-wall radius.

area = @(rad) a.N*a.w*(rad+a.tw)/(a.Rt+a.tw)*depth;

v = md/(area(y(1))*inlet.rho);

dpIn = a.Kin*inlet.rho*v^2/2;

P = a.Pin-dpIn;

Q = 0;

friction = 0;

acceleration = 0;

data = zeros(numel(x)-1,15);

for j = 1:numel(x)-1

xx = (x(j)+x(j+1))/2;

rad = (y(j)+y(j+1))/2;

ds = abs(s(j+1)-s(j));

AR = (rad/a.Rt)^2;

g = a.gamma;

        % Isentropic area-Mach relation.

fun = @(M) (1/M)*(2/(g+1)*(1+(g-1)*M^2/2))^ ((g+1)/(2*(g-1)))-AR;

if abs(AR-1) < 1e-10

M = 1;

elseif xx >= 0

M = fzero(fun,[1,15]);

else

M = fzero(fun,[1e-5,1]);

end

c = statePH(p,P,h);

        % Channel geometry.

w = a.w*(rad+a.tw)/(a.Rt+a.tw);

rib = 2*pi*(rad+a.tw)/a.N-w;

Dh = 2*w*depth/(w+depth);

        % Coolant mass flux and velocity.

G = md/area(rad);

v = G/c.rho;

        % Coolant convection.

Re = G*Dh/c.mu;

Pr = c.cp*c.mu/c.k;

assert(Re >= 1e4, 'Coolant Reynolds number below turbulent correlation range.');

Nu = 0.023*Re^0.8*Pr^0.4;

hc = a.hcFactor*Nu*c.k/Dh;

        % Rib fin efficiency and effective coolant coefficient.

mf = sqrt(2*hc/(a.kw*rib));

eta = tanh(mf*depth)/(mf*depth);

heff = hc*(w+2*eta*depth)/(2*pi*rad/a.N);

        % Gas recovery temperature.

z = 1+(g-1)*M^2/2;

Taw = a.T0*(1+a.Pr^(1/3)*(g-1)*M^2/2)/z;

        % Bartz gas-side coefficient before wall-temperature correction.

base = a.hgFactor*0.026/(2*a.Rt)^0.2 * (a.mu^0.2*a.cp/a.Pr^0.6) * (a.md/a.At)^0.8 * (2*a.Rt/Rf)^0.1 * AR^(-0.9);

hg = @(Tw) base*(0.5*Tw/a.T0*z+0.5)^(-0.68)*z^(-0.12);

        % Coupled wall temperature and heat flux.

residual = @(Tw) Tw-c.T-(Taw-c.T)/ (1/hg(Tw)+a.tw/a.kw+1/heff)* (a.tw/a.kw+1/heff);

Twg = fzero(residual,[c.T,Taw]);

q = hg(Twg)*(Taw-Twg);

Twc = Twg-q*a.tw/a.kw;

        % Segment heat pickup and next coolant enthalpy.

dQ = q*2*pi*rad*ds;

hn = h+dQ/md;

        % Haaland DARCY friction factor.

f = (-1.8*log10( (a.rough/(3.7*Dh))^1.11+6.9/Re))^(-2);

dpf = f*ds/Dh*G^2/(2*c.rho);

        % Iterated pressure-dependent acceleration contribution.

vi = md/(area(y(j))*c.rho);

Pn = P-dpf;

converged = false;

for it = 1:60

out = statePH(p,Pn,hn);

vo = md/(area(y(j+1))*out.rho);

dpa = G*(vo-vi);

target = P-dpf-dpa;

if abs(target-Pn) < 1

Pn = target;

converged = true;

break;

end

Pn = (Pn+target)/2;

end

assert(converged,'Pressure iteration did not converge.');

        % Columns:

        % x,r,M,Taw,Tbulk,P,Twg,Twc,q,v,hg,hc,heff,Re,Pr.

data(j,:) = [ xx,rad,M,Taw,c.T,P,Twg,Twc,q,v, hg(Twg),hc,heff,Re,Pr ];

P = Pn;

h = hn;

Q = Q+dQ;

friction = friction+dpf;

acceleration = acceleration+dpa;

end

    % Outlet minor loss.

out = statePH(p,P,h);

v = md/(area(y(end))*out.rho);

dpOut = a.Kout*out.rho*v^2/2;

P = P-dpOut;

out = statePH(p,P,h);

b = struct( 'data',data, 'mdot',md, 'Q',Q, 'Pout',P, 'Tout',out.T, 'hin',inlet.h, 'hout',h, 'friction',friction, 'acceleration',acceleration, 'minor',dpIn+dpOut);

end

function c = statePT(p,P,T)

if P < p.P(1) || P > p.P(end) || T < p.T(1) || T > p.T(end)
error('Methane outside table: P=%.3f MPa, T=%.2f K. No extrapolation.',P/1e6,T);
end

c = struct( 'T',T, 'h',p.H(T,P), 'rho',p.rho(T,P), 'mu',p.mu(T,P), 'k',p.k(T,P), 'cp',p.cp(T,P));

end

function c = statePH(p,P,h)

if P < p.P(1) || P > p.P(end)

error( 'Methane pressure %.3f MPa outside the 30-60 MPa table.', P/1e6);

end

hs = p.H(p.T,P*ones(size(p.T)));

if h < hs(1) || h > hs(end)

error('Methane enthalpy outside the 110-625 K property table.');

end

T = interp1(hs,p.T,h,'linear');

c = statePT(p,P,T);

end

function p = methaneTable()

    % Compact CoolProp 8.0.0 HEOS methane data.

    % Linear interpolation.

    % Bounds: 110-625 K and 30-60 MPa.

    % No extrapolation is permitted.

    %

    % Data columns:

    % h   [kJ/kg]

    % rho [kg/m3]

    % mu  [microPa s]

    % k   [W/(m K)]

    % cp  [kJ/(kg K)]

    %

    % Converted to SI below.

    %

    % EOS: Setzmann and Wagner (1991), J. Phys. Chem. Ref. Data.

    % https://coolprop.org/fluid_properties/fluids/Methane.html

    %

    % Bartz example: NASA NTRS 20120004103, PDF p.8.

    %

    % A numerical pass does not verify wall strength, surface finish,

    % radiation, transient behavior, manifold losses or full cycle closure.

p.T = [ 110;120;140;160;180;200;220;240;260; 280;300;320;340;360;380;400;420;440; 460;480;500;520;540;560;580;600;625 ];

p.P = [30,40,51.2,60]*1e6;

raw = [ 40.81830 446.91094 163.26388 0.2149246 3.273930; 73.62099 435.58064 132.57990 0.2032755 3.286790; 139.64595 412.43208 95.15729 0.1800074 3.317032; 206.37601 388.45810 73.33862 0.1581246 3.358221; 274.07120 363.49627 58.88664 0.1384387 3.413675; 343.00264 337.49877 48.44732 0.1213366 3.480780; 413.30756 310.65610 40.55766 0.1069272 3.548313; 484.80249 283.54348 34.55684 0.0953539 3.595869; 556.86178 257.14568 30.09375 0.0865540 3.601832; 628.54221 232.60117 26.89572 0.0802433 3.558607; 698.97106 210.75984 24.68984 0.0759759 3.480456; 767.68966 191.92100 23.21273 0.0733049 3.391469; 834.68765 175.92766 22.25098 0.0718789 3.310825; 900.24653 162.39960 21.65046 0.0714389 3.248510; 964.76873 150.91071 21.30403 0.0717892 3.207168; 1028.66441 141.07604 21.13799 0.0727772 3.185455; 1092.29895 132.57800 21.10171 0.0742833 3.180542; 1155.97786 125.16453 21.16023 0.0762136 3.189407; 1219.94891 118.63828 21.28910 0.0784945 3.209339; 1284.41001 112.84485 21.47093 0.0810679 3.238071; 1349.51806 107.66283 21.69315 0.0838876 3.273761; 1415.39695 102.99593 21.94652 0.0869167 3.314935; 1482.14414 98.76707 22.22411 0.0901254 3.360416; 1549.83600 94.91392 22.52070 0.0934891 3.409263; 1618.53203 91.38563 22.83224 0.0969877 3.460721; 1688.27816 88.14028 23.15559 0.1006042 3.514182; 1776.98992 84.42896 23.57268 0.1052693 3.583083; 57.10106 452.76899 176.92650 0.2233659 3.240779; 89.53401 442.11250 143.65326 0.2122118 3.245807; 154.55227 420.60793 103.40689 0.1898694 3.256321; 219.81332 398.76467 80.31985 0.1688534 3.270718; 285.42207 376.54328 65.34750 0.1499716 3.291160; 351.49222 353.99267 54.75581 0.1335563 3.316370; 418.07990 331.28247 46.84306 0.1196656 3.341955; 485.12940 308.72493 40.77817 0.1082954 3.361389; 552.45156 286.75654 36.11203 0.0993169 3.368356; 619.75915 265.86104 32.55495 0.0925095 3.359824; 686.75262 246.45780 29.88269 0.0875789 3.337646; 753.21244 228.81277 27.90606 0.0842038 3.307623; 819.05256 213.01207 26.46559 0.0820864 3.276806; 884.31888 198.99485 25.43248 0.0809809 3.251042; 949.15270 186.61051 24.70730 0.0806962 3.233975; 1013.74662 175.67022 24.21511 0.0810852 3.227167; 1078.30848 165.98133 23.90003 0.0820336 3.230694; 1143.03816 157.36570 23.72044 0.0834506 3.243775; 1208.11544 149.66705 23.64536 0.0852628 3.265248; 1273.69567 142.75218 23.65160 0.0874107 3.293863; 1339.90965 136.50917 23.72172 0.0898453 3.328435; 1406.86569 130.84457 23.84246 0.0925263 3.367905; 1474.65241 125.68044 24.00364 0.0954201 3.411362; 1543.34156 120.95169 24.19738 0.0984988 3.458032; 1612.99075 116.60374 24.41752 0.1017389 3.507266; 1683.64567 112.59064 24.65918 0.1051204 3.558523; 1773.43234 107.98647 24.98567 0.1095205 3.624755; 75.54227 458.75221 192.03906 0.2323675 3.212730; 107.66480 448.70174 155.82145 0.2216748 3.211684; 171.86429 428.62158 112.30065 0.2001460 3.208074; 235.99307 408.52033 87.64382 0.1798206 3.205201; 300.09370 388.39466 71.90400 0.1615069 3.205456; 364.23374 368.30203 60.94421 0.1455143 3.209025; 428.46822 348.36378 52.84110 0.1318862 3.214595; 492.81703 328.76191 46.62800 0.1205687 3.220091; 557.25783 309.72224 41.77814 0.1114159 3.223513; 621.73601 291.48318 37.97207 0.1042297 3.223754; 686.18818 274.25768 34.99037 0.0987781 3.221068; 750.56888 258.20151 32.66634 0.0948155 3.216927; 814.86978 243.39805 30.86683 0.0921043 3.213464; 879.12649 229.86070 29.48413 0.0904314 3.212842; 943.41403 217.54724 28.43169 0.0896163 3.216782; 1007.83553 206.37854 27.64072 0.0895122 3.226363; 1072.50924 196.25594 27.05706 0.0900016 3.242032; 1137.55719 187.07438 26.63830 0.0909906 3.263745; 1203.09687 178.73100 26.35124 0.0924040 3.291125; 1269.23626 171.13002 26.16992 0.0941805 3.323612; 1336.07115 164.18495 26.07397 0.0962700 3.360569; 1403.68455 157.81921 26.04737 0.0986306 3.401357; 1472.14693 151.96570 26.07742 0.1012275 3.445371; 1541.51724 146.56610 26.15405 0.1040313 3.492063; 1611.84406 141.56979 26.26919 0.1070167 3.540947; 1683.16686 136.93291 26.41633 0.1101625 3.591596; 1773.76836 131.58481 26.63732 0.1142923 3.656834; 90.13767 463.10467 203.77965 0.2391662 3.195589; 122.07115 453.45094 165.22346 0.2287866 3.190992; 185.78108 434.27959 119.07436 0.2077862 3.179642; 249.25519 415.24774 93.11695 0.1878766 3.168003; 312.51748 396.35577 76.69709 0.1698734 3.158743; 375.62719 377.65126 65.37056 0.1540825 3.152789; 438.65013 359.22415 57.05455 0.1405484 3.149982; 501.64282 341.19950 50.69108 0.1292072 3.149628; 564.64622 323.72441 45.70130 0.1199147 3.150932; 627.68752 306.94973 41.74035 0.1124858 3.153368; 690.78814 291.01020 38.58187 0.1067135 3.156902; 753.97389 276.00820 36.06303 0.1023837 3.161991; 817.28323 262.00503 34.05895 0.0992890 3.169401; 880.77105 249.02036 32.47055 0.0972392 3.179974; 944.50812 237.03797 31.21822 0.0960671 3.194428; 1008.57731 226.01471 30.23790 0.0956313 3.213243; 1073.06834 215.88988 29.47809 0.0958144 3.236625; 1138.07254 206.59348 28.89748 0.0965209 3.264535; 1203.67842 198.05253 28.46297 0.0976727 3.296742; 1269.96853 190.19533 28.14799 0.0992062 3.332893; 1337.01760 182.95415 27.93124 0.1010693 3.372564; 1404.89160 176.26660 27.79556 0.1032185 3.415311; 1473.64762 170.07614 27.72711 0.1056178 3.460695; 1543.33420 164.33218 27.71468 0.1082365 3.508301; 1613.99192 158.98969 27.74914 0.1110488 3.557749; 1685.65414 154.00878 27.82303 0.1140324 3.608698; 1776.68496 148.23785 27.96163 0.1179737 3.674034; ];

    % Convert tabulated units to SI.

raw(:,1) = raw(:,1)*1000;

raw(:,3) = raw(:,3)*1e-6;

raw(:,5) = raw(:,5)*1000;

fields = {'H','rho','mu','k','cp'};

for j = 1:5

values = reshape(raw(:,j),numel(p.T),numel(p.P));

p.(fields{j}) = griddedInterpolant( {p.T,p.P},values,'linear','none');

end

end
