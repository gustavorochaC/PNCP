import type { Modalidade } from '../types/edital'

export const MODALIDADES: Modalidade[] = [
  { codigo: '1', nome: 'Leilão - Eletrônico' },
  { codigo: '2', nome: 'Diálogo Competitivo' },
  { codigo: '3', nome: 'Concurso' },
  { codigo: '4', nome: 'Concorrência - Eletrônica' },
  { codigo: '5', nome: 'Concorrência - Presencial' },
  { codigo: '6', nome: 'Pregão - Eletrônico' },
  { codigo: '7', nome: 'Pregão - Presencial' },
  { codigo: '8', nome: 'Dispensa de Licitação' },
  { codigo: '9', nome: 'Inexigibilidade' },
  { codigo: '10', nome: 'Manifestação de Interesse' },
  { codigo: '11', nome: 'Pré-qualificação' },
  { codigo: '12', nome: 'Credenciamento' },
  { codigo: '13', nome: 'Leilão - Presencial' },
]

export const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export const STATUS_LIST = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'revogado', label: 'Revogado' },
  { value: 'anulado', label: 'Anulado' },
  { value: 'suspenso', label: 'Suspenso' },
]
