%% ============================================================================
%  uav_pid_control_demo.m  —  Multi-axis PID flight controller (DEMO / TEMPLATE)
%
%  A self-contained quadrotor attitude + altitude controller demo:
%    * cascaded multi-axis PID (roll, pitch, yaw, altitude)
%    * setpoint tracking with a step + ramp reference profile
%    * disturbance rejection (wind gust torque + thrust loss)
%    * fixed-step simulation loop with a simple rigid-body + motor model
%    * plotting of the closed-loop response and control effort
%
%  NOTE: This is a DEMONSTRATION TEMPLATE written to showcase control structure,
%  not flight-tested production code. Gains are illustrative.
%
%  Nate Freese — portfolio demo
%% ============================================================================
clc; clear; close all;

%% ---- Simulation setup ------------------------------------------------------
dt   = 0.002;            % integrator step [s]  (500 Hz inner loop)
Tend = 12;               % total sim time [s]
N    = round(Tend/dt);
t    = (0:N-1)*dt;

%% ---- Vehicle parameters (small quadrotor) ---------------------------------
m   = 1.2;               % mass [kg]
g   = 9.81;              % gravity [m/s^2]
Ixx = 0.015;  Iyy = 0.015;  Izz = 0.028;   % inertia [kg*m^2]
tau_m = 0.03;            % first-order motor/thrust time constant [s]

%% ---- PID gains (roll, pitch, yaw rate, altitude) --------------------------
% gains = [Kp  Ki  Kd]
g_roll  = [6.0  1.2  2.2];
g_pitch = [6.0  1.2  2.2];
g_yaw   = [3.5  0.5  0.8];
g_alt   = [8.0  2.5  5.0];

% anti-windup integrator clamps
I_lim   = [0.6 0.6 0.4 4.0];

%% ---- State -----------------------------------------------------------------
% att = [phi theta psi] (rad), rate = [p q r] (rad/s)
att  = [0 0 0];   rate = [0 0 0];
z    = 0;  zdot = 0;          % altitude [m], climb rate [m/s]
T    = m*g;                   % current total thrust [N] (starts hovering)
I    = zeros(1,4);            % PID integrators
ePrev = zeros(1,4);           % previous errors (for derivative)

% logs
log_att = zeros(N,3);  log_z = zeros(N,1);  log_u = zeros(N,4);  log_ref = zeros(N,4);

%% ---- Reference trajectory --------------------------------------------------
%  step in roll/pitch, ramp in yaw, staircase climb in altitude
ref = @(tt) [ 0.20*(tt>1)              , ...   % roll  setpoint [rad]
             -0.15*(tt>3)              , ...   % pitch setpoint [rad]
              deg2rad(30)*min(tt/6,1)  , ...   % yaw   ramp     [rad]
              1.0*(tt>0.5) + 0.5*(tt>7) ];     % altitude steps [m]

%% ---- Main simulation loop --------------------------------------------------
for k = 1:N
    r = ref(t(k));                         % [phi* theta* psi* z*]
    meas = [att(1) att(2) att(3) z];       % measured states

    % --- PID on each axis (parallel form with anti-windup + derivative) ---
    e  = r - meas;
    I  = I + e*dt;
    I  = max(min(I, I_lim), -I_lim);       % clamp integrators
    de = (e - ePrev)/dt;  ePrev = e;

    u_roll  = g_roll  * [e(1); I(1); de(1)];
    u_pitch = g_pitch * [e(2); I(2); de(2)];
    u_yaw   = g_yaw   * [e(3); I(3); de(3)];
    u_alt   = g_alt   * [e(4); I(4); de(4)];

    % desired torques and thrust
    Mx = Ixx*u_roll;
    My = Iyy*u_pitch;
    Mz = Izz*u_yaw;
    T_cmd = m*(g + u_alt) / max(cos(att(1))*cos(att(2)), 0.5);

    % --- disturbances: wind-gust torque + 15% thrust loss at t = 8 s ---
    gust = [0.05*sin(2*pi*0.7*t(k))*(t(k)>4), 0.04*(t(k)>4&t(k)<4.5), 0];
    if t(k) > 8, T_cmd = 0.85*T_cmd; end

    % --- first-order motor lag on total thrust ---
    T = T + (T_cmd - T)*dt/tau_m;

    % --- rigid-body rotational dynamics (Euler) ---
    pqr_dot = [ (My_term(Mx,gust(1),Iyy,Izz,rate)) , ...
                (Mx_term(My,gust(2),Ixx,Izz,rate)) , ...
                (Mz + gust(3))/Izz ];
    rate = rate + pqr_dot*dt;
    att  = att  + rate*dt;

    % --- vertical (altitude) translational dynamics ---
    az   = (T*cos(att(1))*cos(att(2)) - m*g)/m;
    zdot = zdot + az*dt;
    z    = z + zdot*dt;

    % logs
    log_att(k,:) = att;  log_z(k) = z;
    log_u(k,:)   = [Mx My Mz T];  log_ref(k,:) = r;
end

%% ---- Plots -----------------------------------------------------------------
figure('Color','w','Position',[100 100 900 640]);

subplot(3,1,1); hold on; grid on; box on;
plot(t, rad2deg(log_att(:,1)),'LineWidth',1.5,'DisplayName','roll \phi');
plot(t, rad2deg(log_att(:,2)),'LineWidth',1.5,'DisplayName','pitch \theta');
plot(t, rad2deg(log_ref(:,1)),'--','DisplayName','roll cmd');
plot(t, rad2deg(log_ref(:,2)),'--','DisplayName','pitch cmd');
ylabel('Attitude [deg]'); legend('Location','best');
title('Multi-axis PID — attitude tracking & disturbance rejection');

subplot(3,1,2); hold on; grid on; box on;
plot(t, log_z,'LineWidth',1.6,'DisplayName','altitude z');
plot(t, log_ref(:,4),'--','DisplayName','z cmd');
ylabel('Altitude [m]'); legend('Location','best');

subplot(3,1,3); hold on; grid on; box on;
plot(t, log_u(:,1),'DisplayName','M_x'); plot(t, log_u(:,2),'DisplayName','M_y');
plot(t, log_u(:,4),'DisplayName','Thrust');
xlabel('time [s]'); ylabel('Control effort'); legend('Location','best');

%% ---- Local helper functions ----------------------------------------------
% Euler cross-coupling terms for the body rates (kept as helpers for clarity).
function pdot = My_term(Mx, dist, Iyy, Izz, rate)
    p = rate(1); q = rate(2); rr = rate(3);
    pdot = (Mx + dist + (Iyy - Izz)*q*rr) / Iyy;   %#ok<NASGU>  (roll accel)
end
function qdot = Mx_term(My, dist, Ixx, Izz, rate)
    p = rate(1); q = rate(2); rr = rate(3);
    qdot = (My + dist + (Izz - Ixx)*p*rr) / Ixx;   %#ok<NASGU>  (pitch accel)
end
