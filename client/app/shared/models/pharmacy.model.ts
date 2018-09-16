export class Pharmacy {
  _id?: string;
  poolHandle?: number;
  poolName?: string;
  patientWallet?: number;
  patientWalletName?: string;
  patientWalletCredentials?: object;
  patientDoctorDid?: string;
  patientMasterSecretId?: string;
  pharmacyWallet?: number;
  pharmacyDid?: string;
  doctorPrescriptionCredDefId?: string;
  patientFirstName?: string;
  patientLastName?: string;
  dateOfBirth?: Date;
  status?: string;
  doctorName?: string;
  pdfHash?: string
}
