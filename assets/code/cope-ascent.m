%% COPE Ascent
% AE 451 Detail Design - Team 4
clc; clear; close all;
here = fileparts(mfilename('fullpath'));
J = jsondecode(fileread(fullfile(here,'..','Model','COPE_MassModel.json')));

%% Constants and assumptions
c.g0 = 9.80665;  c.Re = 6371e3;  c.mu = 3.986004e14;  % [m/s^2], [m], [m^3/s^2] Curtis
c.hOrbit = 200e3;  c.lat = 28.5;  c.omega = 7.2921e-5;  % [m] PDR LEO, [deg] KSC, [rad/s]
c.vRot = c.omega*c.Re*cosd(c.lat);  % [m/s]
c.Sref = pi*(J.c.Dveh/2)^2;
c.nLimit = 4.0;  % [g] crew limit
c.tVertical = 8;  % [s]
c.tCoast = 3;  % [s]
c.Pa0 = 101325;  % [Pa]
c.CdM = [0 0.30; 0.8 0.32; 1.0 0.48; 1.2 0.55; 1.5 0.50; 2 0.42; 3 0.33; 5 0.26; 8 0.24; 30 0.24];  % slender LV Cd(M), assumed
S1 = struct('m0',J.S1.M0,'mb',J.S1.Mb,'nEng',J.S1.nEng,'Fvac',J.S1.FvacEng,'Ae',J.S1.Ae,'IspVac',J.S1.IspVacEng);
S2 = struct('m0',J.S2A.M0,'mb',J.S2A.Mb,'nEng',J.S2A.nEng,'Fvac',J.S2A.FvacEng,'Ae',J.S2A.Ae,'IspVac',J.S2A.IspVacEng);
S1.mdot = S1.nEng*S1.Fvac/(S1.IspVac*c.g0);  S2.mdot = S2.nEng*S2.Fvac/(S2.IspVac*c.g0);
vCirc = sqrt(c.mu/(c.Re + c.hOrbit));
c.vTarget = vCirc - c.vRot;  % [m/s]

%% Shooting
p0 = [1.5, 30, 0.10];  % [deg] kick, S2 pitch0, S2 rate [deg/s]
opt = optimset('Display','off','TolX',1e-3,'TolFun',1e-3,'MaxFunEvals',600);
[pBest, fBest] = fminsearch(@(p) shootCost(p, S1, S2, c), p0, opt);
[cost, R] = shootCost(pBest, S1, S2, c);   %#ok<ASGLU>

%% Post-processing
T = R.tab;
[qmax, iq] = max(T.q);
mq = struct('t',T.t(iq),'h',T.h(iq),'v',T.v(iq),'M',T.M(iq),'q',qmax,'rho',T.rho(iq),'m',T.m(iq),'T',T.thrust(iq),'gamma',T.gamma(iq),'nx',T.nx(iq));
i1 = find(T.stage == 1);  iS = i1(end);
dV1 = trapz(T.t(i1), T.thrust(i1)./T.m(i1));
Isp1avg = dV1/(c.g0*log(S1.m0/S1.mb));
gLoss1 = trapz(T.t(i1), T.g(i1).*sind(T.gamma(i1)));
dLoss1 = trapz(T.t(i1), T.D(i1)./T.m(i1));
i2 = find(T.stage == 2);
dV2 = trapz(T.t(i2), T.thrust(i2)./T.m(i2));
gLoss2 = trapz(T.t(i2), T.g(i2).*sind(T.gamma(i2)));
dLoss2 = trapz(T.t(i2), T.D(i2)./T.m(i2));
mS2end = T.m(end);  propMargin = mS2end - S2.mb;
dVmargin = S2.IspVac*c.g0*log(mS2end/S2.mb);
t4g1 = T.t(find(T.stage==1 & T.throttle < 0.999, 1));  t4g2 = T.t(find(T.stage==2 & T.throttle < 0.999, 1));

fid = fopen(fullfile(here,'Ascent_Results.txt'),'w');
fprintf(fid,'COPE ascent simulation (planar, US-76, gravity turn + linear tangent), target %.0f km circular, launch credit %.0f m/s\n', c.hOrbit/1e3, c.vRot);
fprintf(fid,'Steering: kick %.2f deg at t = %d s; Stage 2 pitch %.1f deg - %.3f deg/s (shooting residual %.3g)\n\n', pBest(1), c.tVertical, pBest(2), pBest(3), fBest);
fprintf(fid,'Max-q: %.1f kPa at t = %.1f s, h = %.2f km, V = %.0f m/s, M = %.2f, rho = %.4f kg/m3, mass %.0f t, thrust %.2f MN, gamma %.1f deg, n_x %.2f\n', ...
        mq.q/1e3, mq.t, mq.h/1e3, mq.v, mq.M, mq.rho, mq.m/1e3, mq.T/1e6, mq.gamma, mq.nx);
fprintf(fid,'Stage 1: burnout t = %.1f s, h = %.1f km, V = %.0f m/s, gamma = %.1f deg; thrust-integral dV %.0f m/s; trajectory-averaged Isp %.1f s (SL %.1f, vac %.1f)\n', ...
        T.t(iS), T.h(iS)/1e3, T.v(iS), T.gamma(iS), dV1, Isp1avg, J.S1.IspSlEng, S1.IspVac);
fprintf(fid,'         gravity loss %.0f m/s, drag loss %.0f m/s; 4 g throttling from t = %.1f s\n', gLoss1, dLoss1, t4g1);
fprintf(fid,'Stage 2: cutoff t = %.1f s, h = %.1f km, V = %.0f m/s (+%.0f rotation = %.0f inertial vs %.0f circular), gamma = %.2f deg\n', ...
        T.t(end), T.h(end)/1e3, T.v(end), c.vRot, T.v(end)+c.vRot, vCirc, T.gamma(end));
fprintf(fid,'         thrust-integral dV %.0f m/s, gravity loss %.0f m/s, drag loss %.0f m/s; 4 g throttling from t = %.1f s (%.1f s after ignition)\n', dV2, gLoss2, dLoss2, t4g2, t4g2 - T.t(i2(1)));
fprintf(fid,'         propellant remaining at orbit %.0f kg = %.0f m/s of dV margin\n', propMargin, dVmargin);
fprintf(fid,'Total ideal dV to orbit (thrust integral) %.0f m/s; Rocket Sudoku allocation 10,000 m/s\n', dV1 + dV2);
fclose(fid);
type(fullfile(here,'Ascent_Results.txt'))

out = struct('maxq',mq,'S1',struct('dV',dV1,'IspAvg',Isp1avg,'gLoss',gLoss1,'dLoss',dLoss1,'tBurnout',T.t(iS),'hBurnout',T.h(iS),'vBurnout',T.v(iS),'t4g',t4g1), ...
             'S2',struct('dV',dV2,'gLoss',gLoss2,'dLoss',dLoss2,'tCutoff',T.t(end),'hCutoff',T.h(end),'vCutoff',T.v(end),'propMargin',propMargin,'dVmargin',dVmargin,'t4g',t4g2), ...
             'steering',struct('kick_deg',pBest(1),'pitch0_deg',pBest(2),'rate_deg_s',pBest(3)),'target',struct('h',c.hOrbit,'vCirc',vCirc,'vRot',c.vRot),'assumptions',c);
fh = fopen(fullfile(here,'Ascent_Results.json'),'w'); fwrite(fh, jsonencode(out,'PrettyPrint',true)); fclose(fh);
writetable(T, fullfile(here,'Ascent_Trajectory.csv'));

figure('Position',[50 50 1100 750]);
subplot(2,2,1); plot(T.t, T.h/1e3, 'LineWidth',1.5); grid on; xlabel('t [s]'); ylabel('Altitude [km]'); title('Altitude');
subplot(2,2,2); plot(T.t, T.v, 'LineWidth',1.5); grid on; xlabel('t [s]'); ylabel('Relative velocity [m/s]'); title('Velocity');
subplot(2,2,3); plot(T.t, T.q/1e3, 'LineWidth',1.5); grid on; xlabel('t [s]'); ylabel('q [kPa]'); title(sprintf('Dynamic pressure (max %.1f kPa at %.0f s, %.1f km)', mq.q/1e3, mq.t, mq.h/1e3)); xlim([0 200]);
subplot(2,2,4); plot(T.t, T.nx, 'LineWidth',1.5); hold on; yline(c.nLimit,'--','4 g limit'); grid on; xlabel('t [s]'); ylabel('Axial acceleration [g]'); title('Acceleration and throttle limit');
exportgraphics(gcf, fullfile(here,'Ascent_Profiles.png'), 'Resolution',300);

%% Functions
function [cost, R] = shootCost(p, S1, S2, c)
kick = p(1); th0 = p(2); rate = p(3);
R = flyAscent(kick, th0, rate, S1, S2, c);
hErr = (R.hEnd - c.hOrbit)/1e3;  % [km]
gErr = R.gamEnd;  % [deg]
vErr = max(0, c.vTarget - R.vEnd);  % [m/s]
cost = hErr^2 + (10*gErr)^2 + (vErr/10)^2;
end

function R = flyAscent(kick, th0, rate, S1, S2, c)
% state y = [r; theta; v; gamma; m]
tab = [];
y0 = [c.Re; 0; 1; pi/2; S1.m0];
[t1, y1, tab] = integrate(@(t,y) eom(t,y,1,S1,c,[]), [0 c.tVertical], y0, 1, tab, S1, c, []);
y1(end,4) = deg2rad(90 - kick);
opts = odeset('Events', @(t,y) burnoutEvent(t,y,S1.mb), 'RelTol',1e-7, 'AbsTol',1e-6);
[t2, y2, tab] = integrate(@(t,y) eom(t,y,1,S1,c,[]), [t1(end) 700], y1(end,:)', 1, tab, S1, c, [], opts);
tS = t2(end);
yS = y2(end,:)';  yS(5) = S2.m0;
[t3, y3, tab] = integrate(@(t,y) eom(t,y,0,S2,c,[]), [tS tS + c.tCoast], yS, 0, tab, S2, c, []);
steer = struct('th0',th0,'rate',rate,'t0',t3(end));
opts2 = odeset('Events', @(t,y) s2Event(t,y,S2.mb,c.vTarget), 'RelTol',1e-7, 'AbsTol',1e-6);
[t4, y4, tab] = integrate(@(t,y) eom(t,y,2,S2,c,steer), [t3(end) 1500], y3(end,:)', 2, tab, S2, c, steer, opts2);
R.tab = array2table(tab, 'VariableNames', {'t','h','v','gamma','m','q','M','rho','thrust','D','g','nx','throttle','stage'});
R.hEnd = y4(end,1) - c.Re;  R.vEnd = y4(end,3);  R.gamEnd = rad2deg(y4(end,4));  R.mEnd = y4(end,5);
end

function [t, y, tab] = integrate(f, tspan, y0, stage, tab, S, c, steer, opts)
% integrate one phase, append rows to tab
if nargin < 9, opts = odeset('RelTol',1e-7,'AbsTol',1e-6); end
[t, y] = ode45(f, tspan, y0, opts);
rows = zeros(numel(t), 14);
burning = stage;
for i = 1:numel(t)
    [~, aux] = eom(t(i), y(i,:)', burning, S, c, steer);
    rows(i,:) = [t(i), y(i,1)-c.Re, y(i,3), rad2deg(y(i,4)), y(i,5), aux.q, aux.M, aux.rho, aux.T, aux.D, aux.g, aux.nx, aux.throttle, stage];
end
tab = [tab; rows];
end

function [dy, aux] = eom(t, y, burning, S, c, steer)
r = y(1); v = y(3); gam = y(4); m = y(5);
h = r - c.Re;
[rho, Pa, a] = us76(h);
g = c.mu/r^2;
M = v/a;  Cd = interp1(c.CdM(:,1), c.CdM(:,2), min(M, 30));
q = 0.5*rho*v^2;  D = q*c.Sref*Cd;
throttle = 1;  T = 0;  mdot = 0;
if burning > 0
    Tfull = S.nEng*(S.Fvac - Pa*S.Ae);
    Tmax4g = c.nLimit*c.g0*m;
    T = min(Tfull, Tmax4g);  throttle = T/Tfull;
    mdot = S.mdot*throttle;
end
if burning == 2
    thT = deg2rad(steer.th0 - steer.rate*(t - steer.t0));
    alpha = thT - gam;
else
    alpha = 0;
end
dv  = (T*cos(alpha) - D)/m - g*sin(gam);
if v > 1
    dgam = T*sin(alpha)/(m*v) - (g/v - v/r)*cos(gam);
else
    dgam = 0;
end
dy = [v*sin(gam); v*cos(gam)/r; dv; dgam; -mdot];
aux = struct('q',q,'M',M,'rho',rho,'T',T,'D',D,'g',g,'nx',(T*cos(alpha) - D)/(m*c.g0),'throttle',throttle);
end

function [val, term, dir] = burnoutEvent(~, y, mb)
val = y(5) - mb;  term = 1;  dir = -1;
end
function [val, term, dir] = s2Event(~, y, mb, vT)
val = [y(5) - mb; y(3) - vT];  term = [1; 1];  dir = [-1; 1];
end

function [rho, P, a] = us76(h)
% US-76 atmosphere to 86 km
h = max(h, 0);  R = 287.053;  g0 = 9.80665;
Hb = [0 11 20 32 47 51 71 86]*1e3;  Lb = [-6.5 0 1 2.8 0 -2.8 -2.0]*1e-3;
Tb = 288.15; Pb = 101325;
if h >= 86e3
    T = 186.95;  P = 0.3734*exp(-(h - 86e3)/6000);
else
    for i = 1:7
        if h <= Hb(i+1)
            if Lb(i) == 0
                T = Tb;  P = Pb*exp(-g0*(h - Hb(i))/(R*Tb));
            else
                T = Tb + Lb(i)*(h - Hb(i));  P = Pb*(T/Tb)^(-g0/(Lb(i)*R));
            end
            break
        end
        if Lb(i) == 0, Pb = Pb*exp(-g0*(Hb(i+1) - Hb(i))/(R*Tb)); else, Pb = Pb*((Tb + Lb(i)*(Hb(i+1)-Hb(i)))/Tb)^(-g0/(Lb(i)*R)); end
        Tb = Tb + Lb(i)*(Hb(i+1) - Hb(i));
    end
end
rho = P/(R*T);  a = sqrt(1.4*R*T);
end
