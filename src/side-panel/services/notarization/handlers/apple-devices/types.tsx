type TDevice = Record<string, string | boolean | number | null>;

type TDevicesResponse = {
  devices: TDevice[];
};

export default TDevicesResponse;
