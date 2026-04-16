from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / 'data'
ORACLE_PATH = DATA_DIR / 'Oracle.xlsx'
SHE_PATH = DATA_DIR / 'SHE.xlsx'


def generate_seed_data() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    oracle_df = pd.DataFrame(
        [
            {'Email': 'john.doe@company.com', 'NIC': 'NIC123456V'},
            {'Email': 'priya.fernando@company.com', 'NIC': 'NIC888001V'},
        ]
    )

    she_df = pd.DataFrame(
        [
            {
                'id': 'row-1',
                'name': 'John Doe',
                'nic': 'NIC123456V',
                'dob': '1988-03-14',
                'gender': 'Male',
                'relation': 'Employee',
                'category': 'Executive',
                'effectiveDate': '2025-01-01',
                'grade': 'G7',
                'totalPremium': 15500,
                'note': 'Primary employee profile.',
            },
            {
                'id': 'row-2',
                'name': 'Jane Doe',
                'nic': 'NIC123456V',
                'dob': '1990-07-20',
                'gender': 'Female',
                'relation': 'Spouse',
                'category': 'Dependant',
                'effectiveDate': '2025-01-01',
                'grade': '',
                'totalPremium': 4200,
                'note': '',
            },
            {
                'id': 'row-3',
                'name': 'Ryan Doe',
                'nic': 'NIC123456V',
                'dob': '2015-11-04',
                'gender': 'Male',
                'relation': 'Child',
                'category': 'Dependant',
                'effectiveDate': '2025-01-01',
                'grade': '',
                'totalPremium': 2800,
                'note': '',
            },
            {
                'id': 'row-4',
                'name': 'Priya Fernando',
                'nic': 'NIC888001V',
                'dob': '1992-05-11',
                'gender': 'Female',
                'relation': 'Employee',
                'category': 'Managerial',
                'effectiveDate': '2025-02-01',
                'grade': 'G8',
                'totalPremium': 17000,
                'note': 'Review premium in Q4.',
            },
            {
                'id': 'row-5',
                'name': 'Ishan Fernando',
                'nic': 'NIC888001V',
                'dob': '2018-12-09',
                'gender': 'Male',
                'relation': 'Child',
                'category': 'Dependant',
                'effectiveDate': '2025-02-01',
                'grade': '',
                'totalPremium': 3000,
                'note': '',
            },
        ]
    )

    oracle_df.to_excel(ORACLE_PATH, index=False)
    she_df.to_excel(SHE_PATH, index=False)


if __name__ == '__main__':
    generate_seed_data()
    print('Seeded Oracle.xlsx and SHE.xlsx in data/.')
