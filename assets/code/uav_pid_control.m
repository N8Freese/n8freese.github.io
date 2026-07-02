% uav_pid_control.m
% Cascaded PID attitude + altitude control of a small quadrotor.
% Fixed-step closed-loop simulation: rigid-body rotational dynamics,
% first-order motor lag, gust disturbance, and a mid-flight thrust loss.

clc; clear; close all;

%% Simulation setup
dt   = 0.002;                           % time step [s] (500 Hz loop)
tEnd = 12;                              % duration [s]
n    = round(tEnd/dt);
t    = (0:n-1)*dt;

%% Vehicle parameters
m   = 1.2;                              % mass [kg]
g   = 9.81;                             % gravity [m/s^2]
Ixx = 0.015; Iyy = 0.015; Izz = 0.028;  % inertia [kg m^2]
tauMotor = 0.03;                        % thrust lag time constant [s]

%% PID gains [Kp Ki Kd] per axis, with integrator clamps (anti-windup)
gainRoll  = [6.0 1.2 2.2];
gainPitch = [6.0 1.2 2.2];
gainYaw   = [3.5 0.5 0.8];
gainAlt   = [8.0 2.5 5.0];
intLimit  = [0.6 0.6 0.4 4.0];

%% Reference: roll/pitch steps, yaw ramp, altitude staircase
ref = @(tt) [0.20*(tt > 1), ...
            -0.15*(tt > 3), ...
             deg2rad(30)*min(tt/6, 1), ...
             1.0*(tt > 0.5) + 0.5*(tt > 7)];

%% Initial state
att   = [0 0 0];                        % [phi theta psi] [rad]
rate  = [0 0 0];                        % body rates [p q r] [rad/s]
z     = 0;  zDot = 0;                   % altitude [m], climb rate [m/s]
T     = m*g;                            % thrust [N], starts at hover
intE  = zeros(1,4);
prevE = zeros(1,4);

logAtt = zeros(n,3); logZ = zeros(n,1); logRef = zeros(n,4);

%% Closed-loop simulation
for k = 1:n
    r = ref(t(k));
    e = r - [att z];
    intE  = max(min(intE + e*dt, intLimit), -intLimit);
    dE    = (e - prevE)/dt;
    prevE = e;

    % PID outputs are commanded angular / vertical accelerations
    aCmd = [gainRoll  * [e(1); intE(1); dE(1)], ...
            gainPitch * [e(2); intE(2); dE(2)], ...
            gainYaw   * [e(3); intE(3); dE(3)], ...
            gainAlt   * [e(4); intE(4); dE(4)]];

    Mx = Ixx*aCmd(1);  My = Iyy*aCmd(2);  Mz = Izz*aCmd(3);
    Tcmd = m*(g + aCmd(4)) / max(cos(att(1))*cos(att(2)), 0.5);

    % Disturbances: gust torque after 4 s, 15% thrust loss after 8 s
    gust = [0.02*sin(2*pi*0.7*t(k))*(t(k) > 4), ...
            0.03*(t(k) > 4 & t(k) < 4.5), 0];
    if t(k) > 8
        Tcmd = 0.85*Tcmd;
    end

    % First-order motor lag on total thrust
    T = T + (Tcmd - T)*dt/tauMotor;

    % Rigid-body rotational dynamics (Euler equations)
    p = rate(1); q = rate(2); rBody = rate(3);
    rateDot = [(Mx + gust(1) + (Iyy - Izz)*q*rBody)/Ixx, ...
               (My + gust(2) + (Izz - Ixx)*p*rBody)/Iyy, ...
               (Mz + gust(3) + (Ixx - Iyy)*p*q)/Izz];
    rate = rate + rateDot*dt;
    att  = att + rate*dt;

    % Vertical translation
    zDDot = (T*cos(att(1))*cos(att(2)) - m*g)/m;
    zDot  = zDot + zDDot*dt;
    z     = z + zDot*dt;

    logAtt(k,:) = att;  logZ(k) = z;  logRef(k,:) = r;
end

%% Results
figure; tiledlayout(2,1);

nexttile; hold on; grid on;
plot(t, rad2deg(logAtt(:,1)), 'LineWidth', 1.5)
plot(t, rad2deg(logAtt(:,2)), 'LineWidth', 1.5)
plot(t, rad2deg(logRef(:,1)), 'k--')
plot(t, rad2deg(logRef(:,2)), 'k--')
ylabel('Attitude (deg)')
title('Quadrotor PID: attitude tracking with gust and thrust loss')
legend('roll \phi', 'pitch \theta', 'commands', 'Location', 'best')

nexttile; hold on; grid on;
plot(t, logZ, 'LineWidth', 1.5)
plot(t, logRef(:,4), 'k--')
xlabel('t (s)'); ylabel('Altitude (m)')
legend('altitude', 'command', 'Location', 'best')

exportgraphics(gcf, 'uav_pid_response.png', 'Resolution', 300)
