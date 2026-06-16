clc; 
clear; 
close all;

g0 = 9.80665;

% Assumptions
eps_S1 = 0.14;
eps_S2 = 0.10;
mL = 5000+26520;

% knowns delta v and isp 
% stage 1
Isp_S1 = 350; 
dv_S1 = 3600;

% stage 2
Isp_S2 = 380;  
dv_S2 = 10000 - dv_S1;   

% stage 2 b 
Isp_S2 = 380;  
dv_S2_b = 9500; 

% Mass ratios
R_S1 = exp(dv_S1/(Isp_S1*g0))
R_S2 = exp(dv_S2/(Isp_S2*g0))
R_S2_b = exp(dv_S2_b/(Isp_S2*g0))

%% Stage 2
[m_s2, ms2, mp2, m0_2, mb2] = stagemasses(R_S2, eps_S2, mL);

%% Stage 2 b from leo through rest of mission 
mb2_b  = ms2 + mL; 
mp2_b  = (R_S2_b - 1) * mb2_b;
m0_2_b = mb2_b + mp2_b;
mt2_b  = ms2 + mp2_b;
ms2_b  = ms2; 

%% Stage 1 
[m_s1, ms1, mp1, m0_1, mb1] = stagemasses(R_S1, eps_S1, m0_2);

%% Other Calcs

T_S1 = (2750e3)*8;
T_S2 = (2980e3)*3; 

mdot1 = T_S1/(g0*Isp_S1);
mdot2 = T_S2/(g0*Isp_S2); 

fprintf("\nmdot1 = %.2f kg/s\n", mdot1);
fprintf("mdot2 = %.2f kg/s\n", mdot2);

%% burn times
tb_S1 = mp1 / mdot1;
tb_S2 = mp2 / mdot2;
tb_S2_b  = mp2_b / mdot2;

%% print 
fprintf("\nStage 2\n");
fprintf("initial = %.1f kg, burnout = %.1f kg\n", m0_2, mb2);
fprintf("structural = %.1f kg, prop = %.1f kg\n", ms2, mp2);
fprintf("Burn time Stage 2 = %.1f s (%.2f min)\n", tb_S2, tb_S2/60);

fprintf("\nStage 2b\n");
fprintf("initial = %.1f kg, burnout = %.1f kg\n", m0_2_b, mb2_b);
fprintf("structural = %.1f kg, prop = %.1f kg\n", ms2_b, mp2_b);
fprintf("Burn time Stage 2 = %.1f s (%.2f min)\n", tb_S2_b, tb_S2_b/60);

fprintf("\nStage 1\n");
fprintf("initial= %.1f kg, burnout = %.1f kg\n", m0_1, mb1);
fprintf("structural = %.1f kg, prop = %.1f kg\n", ms1, mp1);
fprintf("Burn time  = %.1f s (%.2f min)\n", tb_S1, tb_S1/60);



%% mass function
function [m_s, ms, mp, m0, mb] = stagemasses(R, eps, mL)

m_s = ((1 - R) / (R*eps - 1)) * mL;

ms = eps * m_s; %struct   
mp = (1 - eps) * m_s; %prop

m0 = m_s + mL; %initial
mb = ms + mL;%burnout
end

%% =========================================
% METHALOX TANK SIZING
% Stage 2 and Stage 2b use the SAME tanks
% ==========================================

% ---------- Total rocket height ----------
H_total_ft = 300;                  
H_total = H_total_ft * 0.3048;     

H_reserved_ft = 60;                
H_reserved = H_reserved_ft * 0.3048;   

H_usable = H_total - H_reserved;   

% ---------- Tank / design assumptions ----------
tankFillFrac = 0.95;     
heightUseFrac = 0.85;    

% ---------- Methalox properties ----------
OF = 3.5;                

rho_lox = 1141;          
rho_ch4 = 422;           

%% ---------- Split rocket height between Stage 1 and upper stage ----------
% Upper stage is the common Stage 2 / 2b hardware, so size that stage once

mwet1 = m0_1 - m0_2;         % Stage 1 wet mass
mwet_upper = m0_2_b - mL;    % Use max upper-stage wet mass for geometry sizing

frac1 = mwet1 / (mwet1 + mwet_upper);
frac_upper = mwet_upper / (mwet1 + mwet_upper);

H_stage1 = frac1 * H_usable;
H_stage2 = frac_upper * H_usable;

H_tank1 = H_stage1 * heightUseFrac;
H_tank2 = H_stage2 * heightUseFrac;

%% ---------- Stage 1 propellant split ----------
mox1 = mp1 * OF/(1 + OF);
mf1  = mp1 /(1 + OF);

Vox1 = mox1 / rho_lox;
Vf1  = mf1  / rho_ch4;

Vtot1 = (Vox1 + Vf1) / tankFillFrac;

%% ---------- Upper Stage tank sizing (use max fill = Stage 2b) ----------
% These are the actual tank sizes

mox2_max = mp2_b * OF/(1 + OF);
mf2_max  = mp2_b /(1 + OF);

Vox2_max = mox2_max / rho_lox;
Vf2_max  = mf2_max  / rho_ch4;

Vtot2_max = (Vox2_max + Vf2_max) / tankFillFrac;

%% ---------- Stage 2 LEO partial-fill case ----------
mox2_leo = mp2 * OF/(1 + OF);
mf2_leo  = mp2 /(1 + OF);

Vox2_leo = mox2_leo / rho_lox;
Vf2_leo  = mf2_leo / rho_ch4;

fill_lox_leo = Vox2_leo / Vox2_max;
fill_ch4_leo = Vf2_leo / Vf2_max;
fill_total_leo = mp2 / mp2_b;

%% ---------- Diameter calculation ----------
D1 = sqrt(4*Vtot1/(pi*H_tank1));
D2 = sqrt(4*Vtot2_max/(pi*H_tank2));

D_common = max([D1, D2]);

%% ---------- Tank heights at common diameter ----------
A_common = pi/4 * D_common^2;

% Stage 1
h_lox1 = Vox1 / A_common;
h_ch41 = Vf1 / A_common;
h_total1 = (h_lox1 + h_ch41) / tankFillFrac;

% Upper stage max-fill tank geometry
h_lox2_max = Vox2_max / A_common;
h_ch42_max = Vf2_max / A_common;
h_total2_max = (h_lox2_max + h_ch42_max) / tankFillFrac;

% Upper stage LEO prop levels inside same tanks
h_lox2_leo = Vox2_leo / A_common;
h_ch42_leo = Vf2_leo / A_common;
h_total2_leo = (h_lox2_leo + h_ch42_leo) / tankFillFrac;

%% ---------- Print results ----------
fprintf('\n========================================\n');
fprintf('COMMON UPPER STAGE TANK SIZING (METHALOX)\n');
fprintf('========================================\n');

fprintf('\nTotal rocket height = %.1f ft (%.2f m)\n', H_total_ft, H_total);
fprintf('Reserved non-tank height = %.1f ft (%.2f m)\n', H_reserved_ft, H_reserved);
fprintf('Usable stage height = %.2f m\n', H_usable);

fprintf('\nEstimated Stage Heights:\n');
fprintf('Stage 1 section height = %.2f m\n', H_stage1);
fprintf('Upper stage section height = %.2f m\n', H_stage2);

fprintf('\nAvailable cylindrical tank heights:\n');
fprintf('Stage 1 tank height = %.2f m\n', H_tank1);
fprintf('Upper stage tank height = %.2f m\n', H_tank2);

fprintf('\n---------- Stage 1 ----------\n');
fprintf('Propellant mass = %.2f kg\n', mp1);
fprintf('LOX mass = %.2f kg\n', mox1);
fprintf('CH4 mass = %.2f kg\n', mf1);
fprintf('LOX volume = %.2f m^3\n', Vox1);
fprintf('CH4 volume = %.2f m^3\n', Vf1);
fprintf('Total tank volume = %.2f m^3\n', Vtot1);
fprintf('Required stage diameter = %.2f m (%.2f ft)\n', D1, D1/0.3048);

fprintf('\n---------- Upper Stage Tank Set (Sized for 2b / Moon Case) ----------\n');
fprintf('Max propellant mass = %.2f kg\n', mp2_b);
fprintf('LOX mass max = %.2f kg\n', mox2_max);
fprintf('CH4 mass max = %.2f kg\n', mf2_max);
fprintf('LOX tank volume = %.2f m^3\n', Vox2_max);
fprintf('CH4 tank volume = %.2f m^3\n', Vf2_max);
fprintf('Total tank volume = %.2f m^3\n', Vtot2_max);
fprintf('Required upper stage diameter = %.2f m (%.2f ft)\n', D2, D2/0.3048);

fprintf('\n---------- LEO Fill Case Using Same Tanks ----------\n');
fprintf('LEO propellant mass = %.2f kg\n', mp2);
fprintf('LOX loaded = %.2f kg\n', mox2_leo);
fprintf('CH4 loaded = %.2f kg\n', mf2_leo);
fprintf('Overall fill fraction = %.3f\n', fill_total_leo);
fprintf('LOX tank fill fraction = %.3f\n', fill_lox_leo);
fprintf('CH4 tank fill fraction = %.3f\n', fill_ch4_leo);

fprintf('\n---------- Common Vehicle Diameter ----------\n');
fprintf('Common diameter = %.2f m (%.2f ft)\n', D_common, D_common/0.3048);

fprintf('\nIf using common diameter %.2f m:\n', D_common);

fprintf('\nStage 1 tank heights:\n');
fprintf('Total Stage 1 prop tank height = %.2f m\n', h_total1);
fprintf('LOX height = %.2f m\n', h_lox1/tankFillFrac);
fprintf('CH4 height = %.2f m\n', h_ch41/tankFillFrac);

fprintf('\nUpper stage tank heights (full / 2b moon case):\n');
fprintf('Total upper-stage prop tank height = %.2f m\n', h_total2_max);
fprintf('LOX height = %.2f m\n', h_lox2_max/tankFillFrac);
fprintf('CH4 height = %.2f m\n', h_ch42_max/tankFillFrac);

fprintf('\nUpper stage prop heights for LEO partial-fill case:\n');
fprintf('Loaded prop height = %.2f m\n', h_total2_leo);
fprintf('LOX loaded height = %.2f m\n', h_lox2_leo/tankFillFrac);
fprintf('CH4 loaded height = %.2f m\n', h_ch42_leo/tankFillFrac);