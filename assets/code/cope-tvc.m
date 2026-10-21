%% COPE TVC
% AE 451 Detail Design - Team 4
clc; clear; close all;
here = fileparts(mfilename('fullpath'));
A  = jsondecode(fileread(fullfile(here,'Ascent_Results.json')));
Mp = jsondecode(fileread(fullfile(here,'..','Mass','MassProperties_Inertia.json')));
J  = jsondecode(fileread(fullfile(here,'..','Model','COPE_MassModel.json')));
g0 = 9.80665;

%% Assumptions
a.Lveh      = 91;  % [m] PDR 1-04
a.Dcap      = 5.0;  % [m] Orion-class
a.Lnose     = 12;  % [m] assumed
a.CNa_cross = 1.0;  % [1/rad] assumed
a.windCoef  = [6.9288 9.144];  % [m/s] AMR 95 % envelope
a.gimbalReq = [6 6];  % [deg] req 1.3.1.3-01 / 1.4.1.3-01
a.gimbalRec = 6;  % [deg] assumed
a.margin    = 1.5;  % assumed
a.misalign  = 0.25;  % [deg] assumed
a.cgOffset  = 0.04;  % [m] assumed
a.muBearing = 0.05;  % assumed
a.rBearing  = 0.15;  % [m] assumed
a.kFlex     = 5e3;  % [N m] assumed
a.ddelta    = 5;  % [rad/s^2] assumed
a.slew      = 10;  % [deg/s] assumed
a.rAct      = 0.60;  % [m] assumed
a.etaAct    = 0.60;  % assumed
a.fosAct    = 1.25;  % assumed
a.rib       = struct('P',90*148/1e3,'m',55*0.4536,'E',1.3);  % [kW, kg, kWh] Moog RIB High Power: 90 A at 148 V min
Sref = pi*(J.c.Dveh/2)^2;

%% Aerodynamics at max-q
mq = A.maxq;
vw = a.windCoef(1)*mq.h/1e3 + a.windCoef(2);
alpha = atand(vw/mq.v);  % [deg]
CNa_nose  = 2*(a.Dcap/J.c.Dveh)^2;
CNa_flare = 2*(1 - (a.Dcap/J.c.Dveh)^2);
CNa = CNa_nose + CNa_flare + a.CNa_cross;
Xcp = a.Lveh - (0.5*a.Lnose*CNa_nose + a.Lnose*CNa_flare + 0.35*a.Lveh*a.CNa_cross)/CNa;
% CG at max-q
V = Mp.stations;  fracRem = (mq.m - J.S1.Mb)/J.S1.Mp;
Hox = J.S1.Hox*fracRem;  Hfu = J.S1.Hfu*fracRem;
items = [J.S1.MpOx*fracRem, V.S1.loxBot + Hox/2;  J.S1.MpFu*fracRem, V.S1.ch4Bot + Hfu/2; ...
         J.S1.Ms, 0.5*(V.S1.loxBot + V.S1.ch4Top);  J.S2A.M0 - J.S2A.ML, Mp.stage.S2.propellant.cg(1);  J.S2A.ML, a.Lveh - 6];
Xcg = sum(items(:,1).*items(:,2))/sum(items(:,1));
armAero = Xcp - Xcg;  armTVC = Xcg - V.S1.gimbal;
Maero = mq.q*Sref*CNa*deg2rad(alpha)*armAero;
Mmis  = mq.T*sind(a.misalign)*armTVC;
Tper  = mq.T/J.S1.nEng;
deltaReq = asind(a.margin*(Maero + Mmis)/(mq.T*armTVC));             % all 8 engines, pitch
% Stage 1 engine-out at max-q
Mout1 = Tper*V.S1.ring;
deltaOut1 = asind((a.margin*(Maero + Mmis) + Mout1)/(7*Tper*armTVC));
% Stage 2 engine-out
X2g = V.S2.gimbal;  F2 = J.S2A.FvacEng;
XcgTLI = (J.S2B.MpOx*(V.S2.loxBot + J.S2A.Hox/2) + J.S2B.MpFu*(V.S2.ch4Bot + J.S2A.Hfu/2) + J.S2A.Ms*0.5*(V.S2.loxBot+V.S2.ch4Top) + J.S2A.ML*(a.Lveh-6))/J.S2B.M0;
arm2 = XcgTLI - X2g;
deltaOut2 = asind(F2*V.S2.ring/(2*F2*arm2));
mLift = J.S2B.Mliftoff;  propL = mLift - J.S2B.Mb;
HoxL = propL*J.c.OF/(1+J.c.OF)/(J.c.rhoLOX*pi*(J.c.Dveh/2)^2);  HfuL = propL/(1+J.c.OF)/(J.c.rhoCH4*pi*(J.c.Dveh/2)^2);
XcgL = (propL*J.c.OF/(1+J.c.OF)*(V.S2.loxBot+HoxL/2) + propL/(1+J.c.OF)*(V.S2.ch4Bot+HfuL/2) + J.S2A.Ms*0.5*(V.S2.loxBot+V.S2.ch4Top) + J.S2A.ML*(a.Lveh-6))/mLift;
deltaOut2L = asind(F2*V.S2.ring/(2*F2*(XcgL - X2g)));

%% Actuator sizing
for k = 1:2
    e = Mp.engine.(sprintf('S%d',k));  F = [J.S1.FslEng J.S2A.FvacEng];  F = F(k);
    Ig = e.Icg_kgm2(2,2) + e.massMEV*e.cg_m(1)^2;
    tq.inertia  = Ig*a.ddelta;
    tq.friction = a.muBearing*F*a.rBearing;
    tq.misalign = F*sind(a.misalign)*e.cg_m(1);
    tq.cgOffset = e.massMEV*4*g0*a.cgOffset;
    tq.flex     = a.kFlex;
    tq.total    = tq.inertia + tq.friction + tq.misalign + tq.cgOffset + tq.flex;
    Fact  = a.fosAct*tq.total/a.rAct;
    vAct  = a.rAct*deg2rad(a.slew);
    Pmech = (tq.total/a.rAct)*vAct;   Pelec = Pmech/a.etaAct;
    ACT(k) = struct('Ig',Ig,'torque',tq,'Fact_kN',Fact/1e3,'v_m_s',vAct,'Pmech_kW',Pmech/1e3,'Pelec_kW',Pelec/1e3, ...
                    'stroke_mm',1e3*a.rAct*deg2rad(a.gimbalRec)); %#ok<SAGROW>
end
nAct = [2*J.S1.nEng 2*J.S2A.nEng];
Pbus = [nAct(1)*ACT(1).Pelec_kW nAct(2)*ACT(2).Pelec_kW];
nRib = [nAct(1)*ceil(ACT(1).Pelec_kW/a.rib.P) nAct(2)*ceil(ACT(2).Pelec_kW/a.rib.P)];
mBatt = nRib*a.rib.m;

%% Concept trade
crit = {'Control authority',20;'Reliability / simplicity',20;'Mass',15;'Isp penalty',15;'Power / fluids',10;'Heritage at 2.6 MN',10;'Packaging',10};
opts = {'Gimbal + EMA','Gimbal + hydraulic','Differential throttle','Jet vanes'};
score = [5 5 2 3; 4 3 3 2; 4 3 5 3; 5 5 4 1; 3 4 5 5; 4 5 2 2; 4 3 5 3];  % rows = criteria, cols = options
w = cell2mat(crit(:,2));  total = w'*score;

%% Report
fid = fopen(fullfile(here,'TVC_Results.txt'),'w');
fprintf(fid,'COPE thrust vector control sizing\n\n');
fprintf(fid,'Max-q state: q %.1f kPa, h %.1f km, V %.0f m/s, M %.2f, mass %.0f t, thrust %.2f MN\n', mq.q/1e3, mq.h/1e3, mq.v, mq.M, mq.m/1e3, mq.T/1e6);
fprintf(fid,'Wind %.1f m/s (AMR 95 %%) -> alpha %.1f deg (no load relief); C_N_alpha %.2f /rad (nose %.2f, flare %.2f, crossflow %.2f)\n', vw, alpha, CNa, CNa_nose, CNa_flare, a.CNa_cross);
fprintf(fid,'X_cp %.1f m, X_cg %.1f m (aero arm %.1f m), TVC arm %.1f m; aero moment %.1f MN m, misalignment %.1f MN m\n', Xcp, Xcg, armAero, armTVC, Maero/1e6, Mmis/1e6);
fprintf(fid,'Stage 1 gimbal required: %.2f deg with %.1fx margin (all 8 engines); %.2f deg with one outer engine out; requirement +/-%g deg\n', deltaReq, a.margin, deltaOut1, a.gimbalReq(1));
fprintf(fid,'Stage 2 engine-out trim (2 of 3, ring %.2f m): %.2f deg at TLI ignition (arm %.1f m), %.2f deg at lunar liftoff -> requirement +/-%g deg leaves %.2fx\n', ...
        V.S2.ring, deltaOut2, arm2, deltaOut2L, a.gimbalReq(2), a.gimbalReq(2)/deltaOut2);
if deltaOut1 > a.gimbalReq(1), fprintf(fid,'  S1 engine-out case needs %.2f deg > +/-%g deg: covered by throttling the opposite outer engine, not by gimbal\n', deltaOut1, a.gimbalReq(1)); end
for k = 1:2
    t = ACT(k).torque;
    fprintf(fid,'S%d actuator: gimbal inertia %.0f kg m2; torque %.1f kN m (inertia %.1f, friction %.1f, misalignment %.1f, CG offset %.1f, flex %.1f); force %.0f kN at %.2f m arm (x%.2f); slew %.0f deg/s -> %.3f m/s, %.1f kW mech / %.1f kW elec each; stroke +/-%.0f mm\n', ...
            k, ACT(k).Ig, t.total/1e3, t.inertia/1e3, t.friction/1e3, t.misalign/1e3, t.cgOffset/1e3, t.flex/1e3, ACT(k).Fact_kN, a.rAct, a.fosAct, a.slew, ACT(k).v_m_s, ACT(k).Pmech_kW, ACT(k).Pelec_kW, ACT(k).stroke_mm);
end
fprintf(fid,'Bus peak (all actuators slewing, bound): S1 %.0f kW, S2 %.0f kW; Moog RIB batteries %d / %d units (%.1f kW each) = %.0f / %.0f kg, %.0f / %.0f kW\n\n', Pbus, nRib, a.rib.P, mBatt, nRib*a.rib.P);
fprintf(fid,'Concept trade (weights sum 100): %s\n', strjoin(opts, ' | '));
for i = 1:size(crit,1), fprintf(fid,'  %-26s (%2d): %s\n', crit{i,1}, crit{i,2}, mat2str(score(i,:))); end
fprintf(fid,'  %-26s      : %s  -> select %s\n', 'Weighted total', mat2str(total), opts{find(total==max(total),1)});
fclose(fid);
type(fullfile(here,'TVC_Results.txt'))

out = struct('maxq',struct('alpha_deg',alpha,'vw',vw,'CNa',CNa,'Xcp',Xcp,'Xcg',Xcg,'armAero',armAero,'armTVC',armTVC,'Maero_MNm',Maero/1e6), ...
             'S1',struct('deltaReq_deg',deltaReq,'deltaEngineOut_deg',deltaOut1,'gimbalReq_deg',a.gimbalReq(1),'actuator',ACT(1),'busPeak_kW',Pbus(1),'battery_kg',mBatt(1),'nRib',nRib(1),'ribPower_kW',nRib(1)*a.rib.P), ...
             'S2',struct('deltaEngineOutTLI_deg',deltaOut2,'deltaEngineOutLunar_deg',deltaOut2L,'gimbalReq_deg',a.gimbalReq(2),'actuator',ACT(2),'busPeak_kW',Pbus(2),'battery_kg',mBatt(2),'nRib',nRib(2),'ribPower_kW',nRib(2)*a.rib.P), ...
             'gimbalRecommended_deg',a.gimbalRec,'trade',struct('options',{opts},'total',total),'assumptions',a);
fh = fopen(fullfile(here,'TVC_Results.json'),'w'); fwrite(fh, jsonencode(out,'PrettyPrint',true)); fclose(fh);

%% Figure
al = 0:0.5:14;
d8 = asind(a.margin*(mq.q*Sref*CNa*deg2rad(al)*armAero + Mmis)/(mq.T*armTVC));
d7 = asind((a.margin*(mq.q*Sref*CNa*deg2rad(al)*armAero + Mmis) + Mout1)/(7*Tper*armTVC));
figure('Position',[50 50 800 450]); hold on; grid on;
plot(al, d8, 'LineWidth',1.8, 'DisplayName','Stage 1, 8 engines, 1.5x margin');
plot(al, d7, 'LineWidth',1.8, 'DisplayName','Stage 1, outer engine out');
yline(a.gimbalReq(1), '--', sprintf('+/-%g deg gimbal', a.gimbalReq(1)), 'HandleVisibility','off');
xline(alpha, ':', sprintf('AMR 95 %% wind, %.1f deg', alpha), 'HandleVisibility','off');
yline(deltaOut2, '-.', sprintf('Stage 2 engine-out at TLI: %.1f deg', deltaOut2), 'Color',[0.5 0 0.5], 'HandleVisibility','off');
xlabel('Angle of attack at max-q [deg]'); ylabel('Required gimbal deflection [deg]');
title('TVC authority at max-q and engine-out'); legend('Location','northwest');
exportgraphics(gcf, fullfile(here,'TVC_Authority.png'), 'Resolution',300);
